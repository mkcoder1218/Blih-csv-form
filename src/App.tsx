/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { initializeStore } from "./services/store";
import { EmployeeFormPortal } from "./pages/EmployeeFormPortal";

export default function App() {
  // Initialize persistence database store
  initializeStore();

  const [token, setToken] = useState<string>("");

  // Hash route listener to parse token if clicked from individual onboarding invites
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "";
      if (hash.startsWith("#/employee-information/")) {
        setToken(hash.replace("#/employee-information/", ""));
      } else {
        // Fallback or generic root loads default draft
        setToken("");
      }
    };

    handleHashChange(); // Run on initial load
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeFormPortal 
        token={token} 
        onNavigateToLogin={() => {}} 
      />
    </div>
  );
}
