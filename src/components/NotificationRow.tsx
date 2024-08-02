import { BellSlashIcon, CheckIcon, ReadIcon } from "@primer/octicons-react";
import {
	type FC,
	type MouseEvent,
	useCallback,
	useContext,
	useState,
} from "react";
import { AppContext } from "../context/App";
import { Opacity, Size } from "../types";
import type { Notification } from "../typesGitHub";
import { cn } from "../utils/cn";
import {
	formatForDisplay,
	isMarkAsDoneFeatureSupported,
} from "../utils/helpers";
import {
	getNotificationTypeIcon,
	getNotificationTypeIconColor,
} from "../utils/icons";
import { openNotification } from "../utils/links";
import { HoverGroup } from "./HoverGroup";
import { InteractionButton } from "./buttons/InteractionButton";
import { NotificationFooter } from "./notification/NotificationFooter";
import { NotificationHeader } from "./notification/NotificationHeader";

interface INotificationRow {
	notification: Notification;
	isAnimated?: boolean;
	isRead?: boolean;
}

export const NotificationRow: FC<INotificationRow> = ({
	notification,
	isAnimated = false,
	isRead = false,
}: INotificationRow) => {
	const {
		settings,
		markNotificationRead,
		markNotificationDone,
		unsubscribeNotification,
	} = useContext(AppContext);
	const [animateExit, setAnimateExit] = useState(false);
	const [showAsRead, setShowAsRead] = useState(false);

	const handleNotification = useCallback(() => {
		setAnimateExit(!settings.delayNotificationState);
		setShowAsRead(settings.delayNotificationState);

		openNotification(notification);

		if (settings.markAsDoneOnOpen) {
			markNotificationDone(notification);
		} else {
			markNotificationRead(notification);
		}
	}, [notification, markNotificationDone, markNotificationRead, settings]);

	const unsubscribeFromThread = (event: MouseEvent<HTMLElement>) => {
		// Don't trigger onClick of parent element.
		event.stopPropagation();

		unsubscribeNotification(notification);
	};

	const NotificationIcon = getNotificationTypeIcon(notification.subject);
	const iconColor = getNotificationTypeIconColor(notification.subject);

	const notificationType = formatForDisplay([
		notification.subject.state,
		notification.subject.type,
	]);

	const notificationNumber = notification.subject?.number
		? `#${notification.subject.number}`
		: "";

	const notificationTitle =
		`${notification.subject.title} ${notificationNumber}`.trim();

	const groupByDate = settings.groupBy === "DATE";

	return (
		<div
			id={notification.id}
			className={cn(
				"group flex border-b border-gray-100 bg-white px-3 py-2 hover:bg-gray-100 dark:border-gray-darker dark:bg-gray-dark dark:text-white dark:hover:bg-gray-darker",
				(isAnimated || animateExit) &&
					"translate-x-full opacity-0 transition duration-[350ms] ease-in-out",
				(isRead || showAsRead) && Opacity.READ,
			)}
		>
			<div
				className={cn("mr-3 flex items-center justify-center", iconColor)}
				title={notificationType}
			>
				<NotificationIcon
					size={groupByDate ? Size.XLARGE : Size.MEDIUM}
					aria-label={notification.subject.type}
				/>
			</div>

			<div
				className="flex-1 truncate cursor-pointer"
				onClick={() => handleNotification()}
			>
				<NotificationHeader notification={notification} />

				<div
					className="flex gap-1 items-center mb-1 truncate text-sm"
					role="main"
					title={notificationTitle}
				>
					<span className="truncate">{notification.subject.title}</span>
					<span
						className={cn(
							"text-xxs",
							Opacity.READ,
							!settings.showNumber && "hidden",
						)}
					>
						{notificationNumber}
					</span>
				</div>

				<NotificationFooter notification={notification} />
			</div>

			{!animateExit && (
				<HoverGroup>
					{isMarkAsDoneFeatureSupported(notification.account) && (
						<InteractionButton
							title="Mark as Done"
							icon={CheckIcon}
							size={Size.MEDIUM}
							onClick={() => {
								setAnimateExit(!settings.delayNotificationState);
								setShowAsRead(settings.delayNotificationState);
								markNotificationDone(notification);
							}}
						/>
					)}
					<InteractionButton
						title="Mark as Read"
						icon={ReadIcon}
						size={Size.SMALL}
						onClick={() => {
							setAnimateExit(!settings.delayNotificationState);
							setShowAsRead(settings.delayNotificationState);
							markNotificationRead(notification);
						}}
					/>
					<InteractionButton
						title="Unsubscribe from Thread"
						icon={BellSlashIcon}
						size={Size.SMALL}
						onClick={unsubscribeFromThread}
					/>
				</HoverGroup>
			)}
		</div>
	);
};
