"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { Toaster } from "sonner";
import { useCompanyStore, useSignalStore, useUIStore } from "@/lib/stores";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { init: initCompanies, companies } = useCompanyStore();
    const { init: initSignals } = useSignalStore();
    const { preferences } = useUIStore();

    // Initialize stores
    useEffect(() => {
        initCompanies();
    }, [initCompanies]);

    useEffect(() => {
        if (companies.length > 0) {
            initSignals(companies);
        }
    }, [companies, initSignals]);

    // Theme
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", preferences.theme);
    }, [preferences.theme]);

    const isHome = pathname === "/";

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-8 lg:py-8">
                    {children}
                </div>
            </main>
            <CommandPalette />
            <Toaster
                position="bottom-right"
                theme={preferences.theme}
                toastOptions={{
                    style: {
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                    },
                }}
            />
        </div>
    );
}
