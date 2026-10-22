import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Passo a Passo — Organização de rotina" },
      { name: "description", content: "Ferramenta de apoio à organização de tarefas e rotina." },
      { property: "og:title", content: "Passo a Passo — Organização de rotina" },
      { property: "og:description", content: "Sem pressa, um passo de cada vez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// O site é feito em HTML/CSS/JS puro (public/app); aqui só o exibimos.
function Index() {
  return (
    <iframe
      src="/app/index.html"
      title="Passo a Passo"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
