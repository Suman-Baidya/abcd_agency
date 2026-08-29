import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Admin Dashboard — ABCD Agency",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Welcome back, Suman. Here&apos;s a summary of your agency&apos;s operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">Export Report</Button>
          <Button variant="primary" size="sm">New Project</Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">Total Revenue</p>
            <span className="text-lg font-bold text-[#0A0A0A] dark:text-white">₹</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white">₹45,231.89</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +20.1% from last month
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">Active Projects</p>
            <svg className="w-5 h-5 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white">+12</p>
            <p className="text-xs font-medium text-[#737373] dark:text-neutral-400 mt-1">
              3 closing this week
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">Total Clients</p>
            <svg className="w-5 h-5 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white">24</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +2 new clients this month
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">Inquiries</p>
            <svg className="w-5 h-5 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A0A0A] dark:text-white">8</p>
            <p className="text-xs font-medium text-[#737373] dark:text-neutral-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              3 unread messages
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (CSS based pseudo-chart) */}
        <Card className="p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Revenue Overview</h2>
            <select className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-2 py-1 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer">
              <option className="dark:bg-[#111111]">Last 6 Months</option>
              <option className="dark:bg-[#111111]">This Year</option>
              <option className="dark:bg-[#111111]">All Time</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 h-48 border-b border-[#E5E5E5] dark:border-[#262626] relative">
            {/* Simple CSS Bar Chart */}
            <div className="absolute top-0 w-full border-t border-dashed border-[#E5E5E5] dark:border-[#262626]"></div>
            <div className="absolute top-1/2 w-full border-t border-dashed border-[#E5E5E5] dark:border-[#262626]"></div>
            
            <div className="w-1/6 flex flex-col items-center gap-2 group z-10">
              <div className="w-full bg-[#E5E5E5] dark:bg-[#262626] rounded-t-sm h-[40%] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors relative">
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹12k</span>
              </div>
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400">Jan</span>
            </div>
            <div className="w-1/6 flex flex-col items-center gap-2 group z-10">
              <div className="w-full bg-[#E5E5E5] dark:bg-[#262626] rounded-t-sm h-[60%] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors relative">
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹18k</span>
              </div>
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400">Feb</span>
            </div>
            <div className="w-1/6 flex flex-col items-center gap-2 group z-10">
              <div className="w-full bg-[#E5E5E5] dark:bg-[#262626] rounded-t-sm h-[45%] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors relative">
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹14k</span>
              </div>
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400">Mar</span>
            </div>
            <div className="w-1/6 flex flex-col items-center gap-2 group z-10">
              <div className="w-full bg-[#E5E5E5] dark:bg-[#262626] rounded-t-sm h-[80%] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors relative">
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹24k</span>
              </div>
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400">Apr</span>
            </div>
            <div className="w-1/6 flex flex-col items-center gap-2 group z-10">
              <div className="w-full bg-[#0A0A0A] dark:bg-white rounded-t-sm h-[95%] relative">
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-[10px] font-bold px-2 py-1 rounded shadow-md">₹32k</span>
              </div>
              <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">May</span>
            </div>
          </div>
        </Card>

        {/* Recent Activity List */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Invoice #304 paid</p>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">ApexFlow Inc. remitted ₹12,500.</p>
                <p className="text-[10px] font-mono text-[#737373] mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">New client inquiry</p>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">Alex from Nexus AI wants a consultation.</p>
                <p className="text-[10px] font-mono text-[#737373] mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#0A0A0A] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Code merged to main</p>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">Sprint 2 completed for RGYCSP.</p>
                <p className="text-[10px] font-mono text-[#737373] mt-1">1 day ago</p>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-6 text-xs">View All Activity</Button>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Active Projects</h2>
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 bg-[#FBFBFB] dark:bg-[#111111] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              <tr className="hover:bg-[#FBFBFB] dark:hover:bg-[#1A1A1A] transition-colors">
                <td className="px-6 py-4 font-semibold text-[#0A0A0A] dark:text-white">ApexFlow Dashboard</td>
                <td className="px-6 py-4">ApexFlow Inc.</td>
                <td className="px-6 py-4 text-center"><Badge variant="solid" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">On Track</Badge></td>
                <td className="px-6 py-4 font-mono">₹18,000</td>
              </tr>
              <tr className="hover:bg-[#FBFBFB] dark:hover:bg-[#1A1A1A] transition-colors">
                <td className="px-6 py-4 font-semibold text-[#0A0A0A] dark:text-white">Nexus AI Pipeline</td>
                <td className="px-6 py-4">Nexus Labs</td>
                <td className="px-6 py-4 text-center"><Badge variant="outline">In Review</Badge></td>
                <td className="px-6 py-4 font-mono">₹32,500</td>
              </tr>
              <tr className="hover:bg-[#FBFBFB] dark:hover:bg-[#1A1A1A] transition-colors">
                <td className="px-6 py-4 font-semibold text-[#0A0A0A] dark:text-white">RGYCSP Portal</td>
                <td className="px-6 py-4">Govt Sector</td>
                <td className="px-6 py-4 text-center"><Badge variant="solid" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none">Delayed</Badge></td>
                <td className="px-6 py-4 font-mono">₹45,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
