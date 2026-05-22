import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminOrSpecialist();

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-50">
      <AdminShell
        role={session.user.role}
        user={{ name: session.user.name ?? null, image: session.user.image ?? null }}
      >
        {children}
      </AdminShell>
    </div>
  );
}
