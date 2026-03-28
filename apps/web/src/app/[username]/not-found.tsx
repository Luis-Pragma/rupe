"use client";

import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";

export default function PerfilNoEncontrado() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0D1117",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 24px", textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        backgroundColor: "rgba(99,181,40,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <UserX size={32} color="rgba(99,181,40,0.4)" />
      </div>
      <h1 style={{ color: "#F0F0EC", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
        Perfil no encontrado
      </h1>
      <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 14, margin: "0 0 32px" }}>
        Este usuario no existe o cambió su nombre de usuario.
      </p>
      <button onClick={() => router.push("/registro")} style={{
        backgroundColor: "#63B528", border: "none",
        borderRadius: 14, padding: "14px 28px",
        color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
      }}>
        Únete a RUPE
      </button>
    </div>
  );
}
