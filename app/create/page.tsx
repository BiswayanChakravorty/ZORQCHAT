import { Suspense } from "react";
import CreateClient from "@/components/CreateClient";

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="container section"><div className="panel">Loading creator…</div></main>}>
      <CreateClient />
    </Suspense>
  );
}
