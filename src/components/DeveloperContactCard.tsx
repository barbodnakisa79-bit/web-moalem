import React from 'react';
import { Phone, Mail, Send, MessageCircle, Instagram, ExternalLink, Heart } from 'lucide-react';
import developerAvatar from '../assets/developer_avatar.jpg';

interface DeveloperContactCardProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const DeveloperContactCard: React.FC<DeveloperContactCardProps> = ({
  onClose,
  showCloseButton = true,
}) => {
  const phoneNum = '09179475205';
  const emailAddr = 'zia.ghasem@gmail.com';

  const socialLinks = [
    {
      name: 'تلگرام',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: 'https://t.me/zia_ghasem',
    },
    {
      name: 'واتساپ',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://wa.me/98${phoneNum.substring(1)}`,
    },
    {
      name: 'بله',
      icon: Send,
      color: 'bg-teal-500 hover:bg-teal-600 text-white',
      url: 'https://ble.ir/zia_ghasem',
    },
    {
      name: 'اینستاگرام',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white',
      url: 'https://instagram.com/zia.ghasem',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 text-center space-y-6 mx-auto">
      {/* Header Title */}
      <div className="flex items-center justify-center gap-2 text-purple-900 font-extrabold text-xl">
        <Heart className="w-5 h-5 text-purple-600 fill-purple-200" />
        <h2>ارتباط با سازنده</h2>
      </div>

      {/* Profile Box */}
      <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/50 border border-purple-100 rounded-2xl p-4 flex items-center gap-4 text-right">
        <img
          src={developerAvatar}
          alt="قاسم ضیاء"
          className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400 p-0.5 shadow-sm bg-white flex-shrink-0"
        />
        <div className="space-y-1 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900">قاسم ضیاء</h3>
          <p className="text-xs font-medium text-slate-500">
            دبیر تاریخ | منطقه علامرودشت
          </p>
          <p className="text-xs font-semibold text-purple-700">
            سازنده و بهینه‌ساز سامانه دستیار هوشمند
          </p>
        </div>
      </div>

      {/* Direct Contact Info */}
      <div className="space-y-3 pt-1">
        <a
          href={`tel:${phoneNum}`}
          className="flex items-center justify-center gap-2 text-slate-800 hover:text-purple-700 font-bold text-sm bg-slate-50 hover:bg-purple-50 p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-200 transition-colors group"
        >
          <Phone className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <span>تلفن تماس: {phoneNum}</span>
        </a>

        <a
          href={`mailto:${emailAddr}`}
          className="flex items-center justify-center gap-2 text-slate-800 hover:text-purple-700 font-bold text-sm bg-slate-50 hover:bg-purple-50 p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-200 transition-colors group"
        >
          <Mail className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <span>ایمیل: {emailAddr}</span>
        </a>
      </div>

      {/* Social Networks */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-4">
          شبکه‌های اجتماعی (ورود مستقیم به صفحه سازنده):
        </p>
        <div className="grid grid-cols-4 gap-3">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${item.color} group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="w-full bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
        >
          بستن
        </button>
      )}
    </div>
  );
};
