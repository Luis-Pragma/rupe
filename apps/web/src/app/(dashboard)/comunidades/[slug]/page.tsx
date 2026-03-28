import { notFound } from "next/navigation";
import { obtenerComunidadPorSlug, obtenerPosts } from "../actions";
import ComunidadClient from "./ComunidadClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ComunidadPage({ params }: Props) {
  const { slug } = await params;
  const { comunidad, esMiembro, userId } = await obtenerComunidadPorSlug(slug);

  if (!comunidad) notFound();

  const posts = await obtenerPosts(comunidad.id);

  return (
    <ComunidadClient
      comunidad={comunidad}
      postsIniciales={posts}
      esMiembro={esMiembro}
      userId={userId}
    />
  );
}
