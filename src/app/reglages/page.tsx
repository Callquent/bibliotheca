import ReglagesForm from "@/components/ReglagesForm";
import { getCleTmdb } from "@/lib/reglages";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const cle = await getCleTmdb();
  const apercu = cle ? `…${cle.slice(-4)}` : null;

  return (
    <>
      <h1 className="page-title mb-4">Réglages</h1>
      <ReglagesForm apercu={apercu} />
    </>
  );
}
