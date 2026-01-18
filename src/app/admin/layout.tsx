import { DashboardLayout } from "@/components/layout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout>
            <div className="relative">
                {/* Admin Badge */}
                <div className="absolute top-0 right-0 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                    ADMIN MODE
                </div>
                {children}
            </div>
        </DashboardLayout>
    );
}
