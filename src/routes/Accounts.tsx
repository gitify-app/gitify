import {
	KeyIcon,
	PersonIcon,
	PlusIcon,
	SignOutIcon,
} from "@primer/octicons-react";

import { type FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { AuthMethodIcon } from "../components/icons/AuthMethodIcon";
import { PlatformIcon } from "../components/icons/PlatformIcon";
import { AppContext } from "../context/App";
import { BUTTON_CLASS_NAME } from "../styles/gitify";
import { type Account, Size } from "../types";
import { getAccountUUID } from "../utils/auth/utils";
import { updateTrayIcon, updateTrayTitle } from "../utils/comms";
import {
	accountProfileURL,
	developerSettingsURL,
	hostURL,
} from "../utils/links";

export const AccountsRoute: FC = () => {
	const { auth, logoutFromAccount } = useContext(AppContext);
	const navigate = useNavigate();

	const logoutAccount = useCallback(
		(account: Account) => {
			logoutFromAccount(account);
			navigate(-1);
			updateTrayIcon();
			updateTrayTitle();
		},
		[logoutFromAccount],
	);

	const loginWithPersonalAccessToken = useCallback(() => {
		return navigate("/login-personal-access-token", { replace: true });
	}, []);

	const loginWithOAuthApp = useCallback(() => {
		return navigate("/login-oauth-app", { replace: true });
	}, []);

	return (
		<div className="flex h-screen flex-col" data-testid="accounts">
			<Header icon={PersonIcon}>Accounts</Header>
			<div className="flex-grow overflow-x-auto px-8">
				<div className="mt-4 flex flex-col text-sm">
					{auth.accounts.map((account) => (
						<div
							key={getAccountUUID(account)}
							className="mb-4 flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-sidebar"
						>
							<div className="ml-2 text-xs">
								<div>
									<a href={accountProfileURL(account)}>
										<button
											type="button"
											className="mb-1 cursor-pointer text-sm font-semibold"
											title="Open Profile"
										>
											@{account.user.login}
											<span
												hidden={!account.user?.name}
												className="pl-1 text-xs font-medium italic"
											>
												- {account.user?.name}
											</span>
										</button>
									</a>
								</div>
								<div>
									<a href={hostURL(account.hostname)}>
										<button
											type="button"
											className="mb-1 ml-1 cursor-pointer align-middle"
											title="Open Host"
										>
											<PlatformIcon
												type={account.platform}
												size={Size.XSMALL}
											/>
											{account.platform} - {account.hostname}
										</button>
									</a>
								</div>
								<div>
									<a href={developerSettingsURL(account)}>
										<button
											type="button"
											className="ml-1 cursor-pointer align-middle"
											title="Open Developer Settings"
										>
											<AuthMethodIcon
												type={account.method}
												size={Size.XSMALL}
											/>
											{account.method}
										</button>
									</a>
								</div>
							</div>
							<div>
								<button
									type="button"
									className={BUTTON_CLASS_NAME}
									title={`Logout ${account.user.login}`}
									onClick={() => logoutAccount(account)}
								>
									<SignOutIcon
										size={Size.XLARGE}
										aria-label={`Logout ${account.user.login}`}
									/>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
				<div className="font-semibold italic">Add new account</div>
				<div>
					<button
						type="button"
						className={BUTTON_CLASS_NAME}
						title="Login with Personal Access Token"
						onClick={loginWithPersonalAccessToken}
					>
						<KeyIcon
							size={Size.LARGE}
							aria-label="Login with Personal Access Token"
						/>
						<PlusIcon size={Size.SMALL} className="mb-2 ml-1" />
					</button>
					<button
						type="button"
						className={BUTTON_CLASS_NAME}
						title="Login with OAuth App"
						onClick={loginWithOAuthApp}
					>
						<PersonIcon size={Size.XLARGE} aria-label="Login with OAuth App" />
						<PlusIcon size={Size.SMALL} className="mb-2" />
					</button>
				</div>
			</div>
		</div>
	);
};
