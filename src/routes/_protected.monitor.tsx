import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/application/dashboard/app-layout";
import { MonitorHome } from "@/components/application/dashboard/monitor-home";

export const Route = createFileRoute("/_protected/monitor")({
	component: () => (
		<AppLayout>
			<MonitorHome />
		</AppLayout>
	),
});
