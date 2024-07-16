import { partialMockUser } from "../__mocks__/partial-mocks";
import { mockGitHubCloudAccount } from "../__mocks__/state-mocks";
import type { Hostname, Link } from "../types";
import type { Repository } from "../typesGitHub";
import * as authUtils from "./auth/utils";
import Constants from "./constants";
import {
	accountProfileURL,
	developerSettingsURL,
	gitHubIssuesURL,
	gitHubNotificationsURL,
	gitHubParticipatingDocsURL,
	gitHubPullsURL,
	gitifyReleaseNotesURL,
	gitifyRepositoryURL,
	hostURL,
	repositoryURL,
	userProfileURL,
} from "./links";

describe("utils/links.ts", () => {
	it("gitifyRepositoryURL", () => {
		expect(gitifyRepositoryURL()).toBe("https://github.com/gitify-app/gitify");
	});

	it("gitifyReleaseNotesURL", () => {
		expect(gitifyReleaseNotesURL("v1.0.0")).toBe(
			"https://github.com/gitify-app/gitify/releases/tag/v1.0.0",
		);
	});

	it("gitHubNotificationsURL", () => {
		expect(gitHubNotificationsURL()).toBe("https://github.com/notifications");
	});

	it("gitHubIssuesURL", () => {
		expect(gitHubIssuesURL()).toBe("https://github.com/issues");
	});

	it("gitHubPullsURL", () => {
		expect(gitHubPullsURL()).toBe("https://github.com/pulls");
	});

	it("accountProfileURL", () => {
		expect(accountProfileURL(mockGitHubCloudAccount)).toBe(
			"https://github.com/octocat",
		);
	});

	it("userProfileURL", () => {
		const mockUser = partialMockUser("mock-user");
		expect(userProfileURL(mockUser)).toBe("https://github.com/mock-user");
	});

	it("hostURL", () => {
		expect(hostURL("github.com" as Hostname)).toBe("https://github.com");
	});

	it("developerSettingsURL", () => {
		const mockSettingsURL = "https://github.com/settings/tokens" as Link;

		jest
			.spyOn(authUtils, "getDeveloperSettingsURL")
			.mockReturnValue(mockSettingsURL);
		expect(developerSettingsURL(mockGitHubCloudAccount)).toBe(mockSettingsURL);
	});

	it("repositoryURL", () => {
		const mockHtmlUrl = "https://github.com/gitify-app/gitify";

		const repo = {
			html_url: mockHtmlUrl,
		} as Repository;

		expect(repositoryURL(repo)).toBe(mockHtmlUrl);
	});

	// it("openNotification", async () => {
	// 	const mockNotificationUrl = mockSingleNotification.repository.html_url;
	// 	jest
	// 		.spyOn(helpers, "generateGitHubWebUrl")
	// 		.mockResolvedValue(mockNotificationUrl);
	// 	await openNotification(mockSingleNotification);
	// 	expect(openExternalLinkMock).toHaveBeenCalledWith(mockNotificationUrl);
	// });

	it("gitHubParticipatingDocsURL", () => {
		expect(gitHubParticipatingDocsURL()).toHaveBeenCalledWith(
			Constants.GITHUB_DOCS.PARTICIPATING_URL,
		);
	});
});
