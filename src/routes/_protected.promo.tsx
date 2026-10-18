import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/application/dashboard/app-layout";
import { PromoHome } from "@/components/application/dashboard/promo-home";
import { parsePromoSearch } from "@/features/promo/promo-demo";

export const Route = createFileRoute("/_protected/promo")({
	validateSearch: parsePromoSearch,
	component: Promo,
});

function Promo() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<AppLayout>
			<PromoHome
				search={search}
				onSearch={(patch) => {
					void navigate({
						search: (previous) => ({ ...previous, ...patch }),
						replace: true,
					});
				}}
			/>
		</AppLayout>
	);
}
