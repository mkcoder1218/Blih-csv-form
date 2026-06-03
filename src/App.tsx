/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  Menu, 
  X, 
  LogOut, 
  UserPlus, 
  Mail, 
  Clock, 
  ShieldCheck 
} from "lucide-react";
import { initializeStore, getActiveSession, setActiveSession } from "./services/store";
import { ActiveUser } from "./types";

// Page Imports
import { HrDashboard } from "./pages/HrDashboard";
import { HrInvitations } from "./pages/HrInvitations";
import { HrSubmissions } from "./pages/HrSubmissions";
import { HrSubmissionDetail } from "./pages/HrSubmissionDetail";
import { EmployeeFormPortal } from "./pages/EmployeeFormPortal";

export default function App() {
  // Initialize persistence data
  initializeStore();

  const [session, setSession] = useState<ActiveUser | null>(
    getActiveSession() || {
      email: "hr@blhierp.com",
      fullName: "HR Admin Portal",
      role: "HR_ADMIN",
    }
  );
  const [route, setRoute] = useState<{ path: string; param?: string }>({ path: "dashboard" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Bulletproof custom Hash router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/hr/dashboard";
      
      if (hash.startsWith("#/employee-information/")) {
        const token = hash.replace("#/employee-information/", "");
        setRoute({ path: "employee-information", param: token });
      } else if (hash.startsWith("#/hr/submissions/")) {
        const id = hash.replace("#/hr/submissions/", "");
        setRoute({ path: "submissions-detail", param: id });
      } else if (hash === "#/hr/dashboard") {
        setRoute({ path: "dashboard" });
      } else if (hash === "#/hr/invitations") {
        setRoute({ path: "invitations" });
      } else if (hash === "#/hr/submissions") {
        setRoute({ path: "submissions" });
      } else {
        setRoute({ path: "dashboard" });
      }
    };

    handleHashChange(); // initial page load Check
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (path: string, param?: string) => {
    setIsSidebarOpen(false); // Close sidebar drawer on mobile clicks
    if (path === "login" || path === "dashboard") {
      window.location.hash = "#/hr/dashboard";
    } else if (path === "invitations") {
      window.location.hash = "#/hr/invitations";
    } else if (path === "submissions") {
      window.location.hash = "#/hr/submissions";
    } else if (path === "submissions-detail") {
      window.location.hash = `#/hr/submissions/${param || ""}`;
    } else if (path === "employee-information") {
      window.location.hash = `#/employee-information/${param || ""}`;
    }
  };

  const handleLoginSuccess = (newSession: ActiveUser) => {
    setSession(newSession);
    navigateTo("dashboard");
  };

  const handleResetData = () => {
    localStorage.clear();
    setSession({
      email: "hr@blhierp.com",
      fullName: "HR Admin Portal",
      role: "HR_ADMIN",
    });
    window.location.hash = "#/hr/dashboard";
    window.location.reload();
  };

  // Guard HR routes: if trying to open HR section without a verified HR session, force lobby redirects
  const isHrRoute = ["dashboard", "invitations", "submissions", "submissions-detail"].includes(route.path);
  const isSessionValid = session && session.role === "HR_ADMIN";

  // Trigger auto-redirect to dashboard on next paint if page security is breached
  useEffect(() => {
    if (isHrRoute && !isSessionValid) {
      navigateTo("dashboard");
    }
  }, [route.path, isSessionValid]);

  // Direct page router switch renders
  const renderPageContent = () => {
    switch (route.path) {
      case "employee-information":
        return (
          <EmployeeFormPortal 
            token={route.param || ""} 
            onNavigateToLogin={() => navigateTo("dashboard")} 
          />
        );

      case "dashboard":
        return isSessionValid ? <HrDashboard onNavigateToSection={navigateTo} /> : null;

      case "invitations":
        return isSessionValid ? <HrInvitations onNavigateToToken={(token) => navigateTo("employee-information", token)} /> : null;

      case "submissions":
        return isSessionValid ? <HrSubmissions onNavigateToSection={navigateTo} /> : null;

      case "submissions-detail":
        return isSessionValid ? (
          <HrSubmissionDetail 
            id={route.param || ""} 
            onNavigateBack={() => navigateTo("submissions")}
            onPostAction={() => navigateTo("submissions")}
          />
        ) : null;

      default:
        return (
          <div className="p-8 text-center bg-white rounded-xl shadow-xs border">
            <h2 className="text-sm font-bold text-slate-800">Route not resolved</h2>
            <button type="button" onClick={() => navigateTo("dashboard")} className="mt-4 text-brand-610 font-bold hover:underline">
              Return Home
            </button>
          </div>
        );
    }
  };

  // If we are currently entering the Employee portal, omit the HR Sidebar Layout Shell completely!
  if (route.path === "employee-information") {
    return <>{renderPageContent()}</>;
  }

  // Sidebar Links config
  const navLinks = [
    { key: "dashboard", label: "Dashboard Hub", icon: Building2 },
    { key: "invitations", label: "Onboarding Invitations", icon: UserPlus },
    { key: "submissions", label: "Submissions Registry", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 1. PERSISTENT SIDEBAR - Tablet/Desktop viewports */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col text-slate-100 shrink-0">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center select-none shrink-0 font-bold">
            BL
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider leading-none">Recruiter Panel</h2>
            <span className="text-[13px] font-bold text-white tracking-tight mt-1.5 block leading-none">Blih ERP Portal</span>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((lnk) => {
            const ActiveIcon = lnk.icon;
            const isActive = route.path === lnk.key || (lnk.key === "submissions" && route.path === "submissions-detail");
            return (
              <button
                key={lnk.key}
                onClick={() => navigateTo(lnk.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left
                  ${isActive 
                    ? "bg-brand-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-150"}
                `}
              >
                <ActiveIcon className="w-4.5 h-4.5" />
                <span>{lnk.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 uppercase font-bold text-xs select-none shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-200">HR Administrator</span>
              <p className="text-[10px] text-slate-500 truncate font-mono" title={session?.email}>{session?.email}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer bg-slate-900/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </aside>

      {/* 2. SLIDING DRAWER SIDEBAR - Mobile viewports */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <aside 
            className="w-64 max-w-[80vw] h-full bg-slate-950 border-r border-slate-800 flex flex-col text-slate-100 transform transition-transform animate-in slide-in-from-left duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-900 font-bold flex items-center justify-center select-none text-xs">
                  B
                </div>
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Recruiter Desk</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map((lnk) => {
                const ActiveIcon = lnk.icon;
                const isActive = route.path === lnk.key || (lnk.key === "submissions" && route.path === "submissions-detail");
                return (
                  <button
                    key={lnk.key}
                    onClick={() => navigateTo(lnk.key)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer text-left
                      ${isActive 
                        ? "bg-brand-600 text-white" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"}
                    `}
                  >
                    <ActiveIcon className="w-4.5 h-4.5" />
                    <span>{lnk.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-805 space-y-3 bg-slate-950/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-340 text-xs font-bold font-mono">
                  AD
                </div>
                <p className="text-[10px] text-slate-400 truncate font-mono">{session?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-rose-900/10 text-xs text-rose-450 rounded-lg font-semibold cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Global Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span className="hidden sm:inline font-semibold">Security Level:</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wide">
                SSL_AUTHORIZED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border px-2.5 py-0.5.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>2026-06-03 UTC</span>
            </span>
          </div>
        </header>

        {/* Dynamic Workspace Switcher Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {renderPageContent()}
          </div>
        </main>

        {/* Bottom standard trademark signature */}
        <footer className="h-10 text-[11px] text-slate-400 border-t border-slate-205 flex items-center justify-center bg-white">
          <p>© 2026 Blih ERP People Operations. Confidential Records Sealed.</p>
        </footer>

      </div>

    </div>
  );
}
