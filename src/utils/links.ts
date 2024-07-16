import { shell } from "electron";
import {
	type Account,
	type Hostname,
	type Link,
	OpenPreference,
} from "../types";
import type { Notification, Repository, SubjectUser } from "../typesGitHub";
import { getDeveloperSettingsURL } from "./auth/utils";
import Constants from "./constants";
import { generateGitHubWebUrl } from "./helpers";
import { isMacOS } from "./platform";
import { loadState } from "./storage";

export function gitifyRepositoryURL() {
	return `https://github.com/${Constants.REPO_SLUG}`;
}

export function gitifyReleaseNotesURL(version: string): Link {
	return `https://github.com/${Constants.REPO_SLUG}/releases/tag/${version}` as Link;
}

export function gitHubNotificationsURL() {
	return "https://github.com/notifications" as Link;
}

export function gitHubIssuesURL() {
	return "https://github.com/issues" as Link;
}

export function gitHubPullsURL() {
	return "https://github.com/pulls" as Link;
}

export function accountProfileURL(account: Account) {
	const url = new URL(`https://${account.hostname}`);
	url.pathname = account.user.login;
	return url.toString() as Link;
}

export function userProfileURL(user: SubjectUser) {
	return user.html_url;
}

export function hostURL(hostname: Hostname) {
	return `https://${hostname}` as Link;
}

export function developerSettingsURL(account: Account) {
	return getDeveloperSettingsURL(account);
}

export function repositoryURL(repository: Repository) {
	return repository.html_url;
}

export async function openNotification(
	notification: Notification,
	shouldOpenInBackground = false,
) {
	const url = await generateGitHubWebUrl(notification);
	shell.openExternal(url, { activate: !shouldOpenInBackground });
}

export function gitHubParticipatingDocsURL() {
	return Constants.GITHUB_DOCS.PARTICIPATING_URL;
}

export const globalClickHandler = (event: MouseEvent) => {
	const target = event.target as HTMLElement;
	let url = null;

	// Find the closest Anchor element
	if (target instanceof HTMLAnchorElement) {
		url = target.href;
	} else {
		let parentElement = target.parentElement;
		while (parentElement) {
			if (parentElement instanceof HTMLAnchorElement) {
				url = parentElement.href;
				break;
			}
			parentElement = parentElement.parentElement;
		}
	}

	if (url) {
		event.preventDefault();
		event.stopPropagation();

		const { settings } = loadState();

		const userOpenBackground = isCtrlOrMetaKey(event);
		const openLinkPreferenceBackground =
			settings.openLinks === OpenPreference.BACKGROUND;

		openLinkInBrowser(
			url,
			!userOpenBackground && !openLinkPreferenceBackground,
		);
	}
};

function openLinkInBrowser(url: string, shouldOpenInForeground = true) {
	shell.openExternal(url, {
		activate: shouldOpenInForeground,
	});
}

export function isCtrlOrMetaKey(event: MouseEvent) {
	return isMacOS() ? event.metaKey : event.ctrlKey;
}
