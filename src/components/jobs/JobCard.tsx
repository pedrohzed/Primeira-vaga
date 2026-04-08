"use client";

import Link from "next/link";
import { MapPin, Building2, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/data";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm transition-colors hover:border-purple-500/30 hover:bg-zinc-900/80"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 z-10">
          <Link href={`/vagas/${job.id}`} className="inline-block">
            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-purple-400 transition-colors">
              {job.title}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Clock className="h-4 w-4" />
              {job.type}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-zinc-300 line-clamp-2 mt-2">
        {job.description}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between z-10">
        <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
          {job.tags.length > 3 && (
            <Badge variant="outline">+{job.tags.length - 3}</Badge>
          )}
        </div>
        <Link 
          href={`/vagas/${job.id}`}
          className="flex items-center justify-center p-2 rounded-full bg-purple-600/10 text-purple-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-purple-600 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
      {/* Decorative Glow */}
      <div className="absolute inset-0 z-0 h-full w-full rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>
    </motion.div>
  );
}
