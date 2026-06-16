export function generateStaticParams() {
  return [{ id: "demo-campaign-1" }, { id: "demo-campaign-2" }];
}

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
