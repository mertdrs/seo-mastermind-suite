import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/project/$projectId/site-audit/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/project/$projectId/site-audit/ueberblick",
      params: { projectId: params.projectId },
    });
  },
});