import {
	createRouter as createTanStackRouter,
	Link,
} from "@tanstack/react-router";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
	});

	return router;
}

function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background-full p-8 text-center">
			<h1 className="text-title-1-medium text-text-primary">404</h1>
			<p className="text-body-regular text-text-secondary">
				Halaman tidak ditemukan.
			</p>
			<Link
				to="/"
				className="text-body-medium text-accent-600 underline-offset-4 hover:underline"
			>
				Kembali ke beranda
			</Link>
		</div>
	);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
