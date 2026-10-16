const RELEASE_PLEASE_BRANCH_PREFIX = 'release-please--';

export function releaseNoticeMarker(tag) {
  return `<!-- gitify-release-notice:${tag} -->`;
}

export function releaseNoticeBody(tag, releaseUrl) {
  return [
    `🎉 This pull request is included in **[Gitify ${tag}](${releaseUrl})**! 🎉`,
    '',
    'Downloads for macOS, Windows, and Linux are available on the release page.',
    '',
    'Thanks for helping make Gitify better!',
    '',
    releaseNoticeMarker(tag),
  ].join('\n');
}

export async function findVersionMilestone(github, repository, tag) {
  const milestoneTitle = `Release ${tag.replace(/^v/, '')}`;
  const milestones = await github.paginate(github.rest.issues.listMilestones, {
    ...repository,
    state: 'all',
    per_page: 100,
  });
  const matches = milestones.filter((milestone) => milestone.title === milestoneTitle);

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one milestone titled ${milestoneTitle}; found ${matches.length}`,
    );
  }

  return matches[0];
}

export async function listMilestoneItems(github, repository, milestoneNumber) {
  return github.paginate(github.rest.issues.listForRepo, {
    ...repository,
    milestone: String(milestoneNumber),
    state: 'all',
    per_page: 100,
  });
}

export function isEligiblePullRequest(pullRequest) {
  return Boolean(
    pullRequest.merged_at && !pullRequest.head.ref.startsWith(RELEASE_PLEASE_BRANCH_PREFIX),
  );
}

export async function hasReleaseNotice(github, repository, pullRequestNumber, marker) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...repository,
    issue_number: pullRequestNumber,
    per_page: 100,
  });
  return comments.some((comment) => comment.body?.includes(marker));
}

export async function notifyReleasedPullRequests(github, { owner, repo, tag }) {
  const repository = { owner, repo };
  const { data: release } = await github.rest.repos.getReleaseByTag({
    ...repository,
    tag,
  });
  if (release.draft) {
    throw new Error(`Release ${tag} is still a draft`);
  }

  const milestone = await findVersionMilestone(github, repository, tag);
  const items = await listMilestoneItems(github, repository, milestone.number);
  const marker = releaseNoticeMarker(tag);
  const failures = [];
  let notified = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.pull_request) {
      skipped += 1;
      continue;
    }

    try {
      const { data: pullRequest } = await github.rest.pulls.get({
        ...repository,
        pull_number: item.number,
      });
      if (!isEligiblePullRequest(pullRequest)) {
        skipped += 1;
        continue;
      }

      if (await hasReleaseNotice(github, repository, item.number, marker)) {
        skipped += 1;
        continue;
      }

      await github.rest.issues.createComment({
        ...repository,
        issue_number: item.number,
        body: releaseNoticeBody(tag, release.html_url),
      });
      notified += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(new Error(`Pull request #${item.number}: ${message}`, { cause: error }));
    }
  }

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `Failed to notify ${failures.length} pull request(s); ${notified} succeeded`,
    );
  }

  return { notified, skipped };
}
