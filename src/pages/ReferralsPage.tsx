import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { AppLogo } from '../components/common/AppLogo';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Gift, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Award, 
  ArrowRight, 
  Send, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ReferredFriend } from '../types';

export const ReferralsPage: React.FC = () => {
  const { user, addToast, referrals, addReferral, claimReferralRewards, processDeposit } = useTrading();

  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [claiming, setClaiming] = useState(false);

  const RATE_UGX = 3750;
  const partnerCode = user.partnerCode || `UG-${user.id.substring(4, 10).toUpperCase()}`;
  const referralLink = `${window.location.origin}/?ref=${partnerCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addToast('success', 'Link Copied!', 'Your referral link has been copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;
    addReferral(friendEmail);
    setFriendEmail('');
  };

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => {
      claimReferralRewards();
      setClaiming(false);
    }, 800);
  };

  const totalFriendsCount = referrals.length;
  const activeTradersCount = referrals.filter((f) => f.status === 'active').length;
  const totalEarnedSoFar = referrals.filter((f) => f.status === 'active').reduce((acc, f) => acc + (f.earnedUSD || 1.25), 0);
  const unclaimedRewards = referrals.filter((f) => f.status === 'active').reduce((acc, f) => acc + f.earnedUSD, 0);

  const handleSimulateDemoFriend = () => {
    const demoNames = ['Brian M.', 'Jane D.', 'Kevin O.', 'Patricia N.'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const randomEmail = `${randomName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`;
    addReferral(randomEmail);
  };

  return (
    <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#24272A]">
        <div>
          <h1 className="text-xl font-bold text-[#F4F4F5] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#20C77A]" />
            <span>Referrals & Rewards</span>
          </h1>
          <p className="text-xs text-[#8B8F94]">Earn $1.25 USD instantly when a referred friend completes their first deposit.</p>
        </div>
        <AppLogo size="sm" />
      </div>

      {/* Referral Link & Code Box */}
      <div className="bg-gradient-to-br from-[#151719] via-[#0D132B] to-[#151719] border border-[#20C77A]/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#20C77A]/20 text-[#20C77A]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F4F4F5]">Your Partner Invite Code</h2>
              <p className="text-[10px] text-[#8B8F94]">Share on WhatsApp, Telegram, or social media</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-[#20C77A] bg-[#20C77A]/10 border border-[#20C77A]/30 px-3 py-1 rounded-full">
            Code: {partnerCode}
          </span>
        </div>

        {/* Copy Bar */}
        <div className="flex items-center bg-[#0D0F10] border border-[#24272A] rounded-xl p-1.5 px-3 focus-within:border-[#20C77A] transition">
          <span className="text-xs font-mono text-[#8B8F94] truncate flex-1 mr-2 font-medium">
            {referralLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-lg bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Direct Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join me on Synthetic Trading Terminal! Use my referral code: ${partnerCode} or link: ${referralLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join ApexTrades with my code ${partnerCode}!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0088cc]/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>

          <a
            href={`mailto:?subject=Join%20Synthetic%20Trading%20Terminal&body=Check%20out%20this%20trading%20platform:%20${referralLink}`}
            className="py-2 px-3 rounded-xl bg-[#29D3D8]/10 border border-[#29D3D8]/30 text-[#29D3D8] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#29D3D8]/20 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Invited */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Invited Friends</span>
          <span className="font-mono font-bold text-xl text-[#F4F4F5]">{totalFriendsCount}</span>
          <span className="text-[9px] text-[#8B8F94] block">All-time referrals</span>
        </div>

        {/* Active Traders */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Deposited Friends</span>
          <span className="font-mono font-bold text-xl text-[#20C77A]">{activeTradersCount}</span>
          <span className="text-[9px] text-[#8B8F94] block">Qualified for $1.25</span>
        </div>

        {/* Total Earned */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Total Earned</span>
          <span className="font-mono font-bold text-lg text-[#E6C33A]">
            ${totalEarnedSoFar.toFixed(2)} USD
          </span>
          <span className="text-[9px] text-[#8B8F94] block">≈ {(totalEarnedSoFar * RATE_UGX).toLocaleString()} UGX</span>
        </div>

        {/* Unclaimed Rewards */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#20C77A]/40 space-y-1 bg-gradient-to-b from-[#151719] to-[#20C77A]/10">
          <span className="text-[10px] text-[#20C77A] uppercase font-bold block">Unclaimed Reward</span>
          <span className="font-mono font-bold text-lg text-[#20C77A]">
            ${unclaimedRewards.toFixed(2)} USD
          </span>
          <button
            onClick={handleClaim}
            disabled={unclaimedRewards <= 0 || claiming}
            className="w-full mt-1 py-1 px-2 rounded-lg bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] text-[10px] font-bold transition disabled:opacity-40"
          >
            {claiming ? 'Claiming...' : 'Claim to Balance'}
          </button>
        </div>
      </div>

      {/* Direct Invite Input Form */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#20C77A] uppercase tracking-wider">
          <UserPlus className="w-4 h-4" />
          <span>Invite a Friend via Email</span>
        </div>

        <form onSubmit={handleSendInvite} className="flex gap-2">
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="friend.email@example.com"
            className="flex-1 bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2.5 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#20C77A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Invite</span>
          </button>
        </form>
      </div>

      {/* Referred Friends List */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#20C77A]" />
            <span>Your Referred Friends ({referrals.length})</span>
          </div>
          {referrals.length > 0 && (
            <span className="text-[10px] text-[#8B8F94]">Live Status</span>
          )}
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 border border-dashed border-[#24272A] rounded-xl text-center space-y-3 bg-[#121416]/50">
            <div className="w-10 h-10 rounded-full bg-[#20C77A]/10 text-[#20C77A] flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#F4F4F5]">No Referred Friends Yet</h3>
              <p className="text-[11px] text-[#8B8F94] max-w-sm mx-auto">
                Share your referral link on WhatsApp or Telegram. When a friend signs up, they appear as <strong>Pending Deposit</strong>, and as soon as they make their first deposit, you instantly earn <strong>$1.25 USD</strong>!
              </p>
            </div>
            <button
              onClick={handleSimulateDemoFriend}
              className="px-3 py-1.5 rounded-lg bg-[#24272A] hover:bg-[#20C77A]/20 text-[#20C77A] text-[11px] font-semibold transition border border-[#20C77A]/30"
            >
              + Test Demo Referral
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-[#121416] border border-[#24272A] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#20C77A]/20 text-[#20C77A] font-bold text-xs flex items-center justify-center font-mono">
                    {f.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#F4F4F5]">{f.name}</div>
                    <div className="text-[10px] text-[#8B8F94]">{f.email} • Joined {f.joinedDate}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-[#20C77A]">
                    {f.status === 'active' ? '+$1.25 USD' : '$0.00 USD'}
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                      f.status === 'active'
                        ? 'bg-[#20C77A]/10 text-[#20C77A] border-[#20C77A]/30'
                        : 'bg-[#E6C33A]/10 text-[#E6C33A] border-[#E6C33A]/30'
                    }`}
                  >
                    {f.status === 'active' ? 'Active / $1.25 Rewarded' : 'Pending Deposit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commission Rules */}
      <div className="p-4 rounded-2xl bg-[#0D0F10] border border-[#24272A] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E6C33A]">
          <Award className="w-4 h-4" />
          <span>How Referral Rewards Work</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#8B8F94]">
          <div className="p-2.5 rounded-xl bg-[#151719] border border-[#24272A]">
            <strong className="text-[#F4F4F5] block font-bold">1. Shared Referral Code</strong>
            When a friend signs up using your link or partner code, they appear in your list as <span className="text-[#E6C33A]">Pending Deposit</span>.
          </div>
          <div className="p-2.5 rounded-xl bg-[#151719] border border-[#24272A]">
            <strong className="text-[#F4F4F5] block font-bold">2. First Deposit Reward ($1.25)</strong>
            When your referred friend completes their first real deposit, your account automatically receives an instant <span className="text-[#20C77A]">$1.25 USD reward</span>!
          </div>
        </div>
      </div>
    </div>
  );
};
