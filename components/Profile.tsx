
import React from 'react';

const UserAvatar = () => (
    <img alt="User Avatar" className="size-24 rounded-full object-cover border-4 border-[var(--primary-color)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuICRp4w32J7Vwelo_d3fF6n4IJjblgTmkH7oF2xAfFY_kENv-IJS5GyUg9b5EpMos1vDbxKziI33GTYwpl-LY3p8_FyiQeARRusORh58rvAVzZUtcNgbVESL7DW2FbjkKCscj4ldLaj6ysZOBi_MififN8pOkqI2PUUhXVTZuErGpK51o0H4JbSauiKsVNVW1VK7296hbxRSV42tr8iw8sMOW480D4DuBYWphbZtoL8Vl5RKaEnYxEMbyzSIQsc1SA49IqyfFFUSC"/>
);

export const Profile: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-black p-4 pb-3 border-b border-[#1C1C1E]">
        <div className="w-8"></div>
        <h1 className="text-white text-lg font-bold">Profile</h1>
        <div className="w-8"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 text-center flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <UserAvatar />
            <h2 className="text-2xl font-bold text-white mt-4">Stitch User</h2>
            <p className="text-gray-400">stitch.user@example.com</p>
            <div className="mt-6 w-full max-w-sm text-left space-y-4">
                 <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-[#1C1C1E] hover:bg-[#2c2c2e] transition-colors">
                    <span className="material-symbols-outlined text-gray-400">account_circle</span>
                    <span className="text-white">Account Settings</span>
                </button>
                 <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-[#1C1C1E] hover:bg-[#2c2c2e] transition-colors">
                    <span className="material-symbols-outlined text-gray-400">palette</span>
                    <span className="text-white">Appearance</span>
                </button>
                 <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-[#1C1C1E] hover:bg-[#2c2c2e] transition-colors">
                    <span className="material-symbols-outlined text-gray-400">logout</span>
                    <span className="text-red-400">Log Out</span>
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};
