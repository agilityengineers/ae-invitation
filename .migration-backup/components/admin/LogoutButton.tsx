"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }
  return (
    <button onClick={logout} className="text-sm font-semibold text-muted underline hover:text-navy">
      Log out
    </button>
  );
}
