import React from 'react';
import { Bell, Check, XCircle } from 'lucide-react';

const StatusBar: React.FC = () => {
    return (
        <div className="h-6 bg-[#7aa2f7] text-[#1a1b26] flex items-center justify-between px-3 text-xs select-none font-medium">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <Check size={12} />
                    <span>Ready</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
                    <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
                    <Bell size={12} />
                    <span>Notifications</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
