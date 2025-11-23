'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for Overview Tab - only data areas
export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Users Tab - only data areas
export const UsersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards - matching UserManagement layout */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header with title and button */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>

        {/* Table content */}
        <div className="p-4">
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 border-b">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Table Rows */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-3 border-b last:border-b-0 items-center">
                {/* User column with avatar */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                {/* Email */}
                <Skeleton className="h-4 w-full" />
                {/* Role chip */}
                <Skeleton className="h-6 w-16 rounded-full" />
                {/* Status chip */}
                <Skeleton className="h-6 w-20 rounded-full" />
                {/* Date */}
                <Skeleton className="h-4 w-24" />
                {/* Actions - single dropdown button */}
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for Courses Tab - only data areas
export const CoursesSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for Analytics Tab - only data areas
export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-56 w-full rounded" />
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { OverviewSkeleton as AdminDashboardSkeleton };
