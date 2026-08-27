import React from "react";
import Link from "next/link";
import { Mail, Phone, Download } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";

interface PageHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  icon?: React.ReactNode;
  showSocials?: boolean;
}

export async function PageHeader({ subtitle, title, description, breadcrumbs, icon, showSocials = true }: PageHeaderProps) {
  const siteConfig = await getSiteConfig();
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] border-b-2 border-white dark:border-[#262626] min-h-[320px] flex items-center">
      {/* Background diagonal line texture (Left side) */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 8px)',
          backgroundSize: '12px 12px' 
        }} 
      />

      {/* Middle overlapping geometric diagonal shape */}
      <div aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full drop-shadow-2xl">
          {/* Base right side covering */}
          <polygon points="60,0 100,0 100,100 40,100" className="fill-[#111111]" />
          
          {/* Overlapping middle layer 1 */}
          <polygon points="40,20 70,20 50,100 20,100" className="fill-[#1a1a1a]" />
          
          {/* Overlapping middle layer 2 */}
          <polygon points="30,0 65,0 45,80 10,80" className="fill-[#262626]" />

          {/* Edge highlight to emphasize the cut */}
          <polygon points="60,0 60.2,0 40.2,100 40,100" className="fill-[#E5E5E5] opacity-20" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
        
        {/* LEFT COLUMN: Text & Actions */}
        <div className="max-w-2xl flex-1 pt-4">
          {/* Pagination / Subtitle */}
          {breadcrumbs ? (
            <nav className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-white/60 mb-4 uppercase" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.label}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors duration-200">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white font-bold">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-2 text-white/40 font-bold">&gt;</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : subtitle ? (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">{subtitle}</span>
              <span aria-hidden="true" className="w-12 h-[1px] bg-white/20" />
            </div>
          ) : null}
          
          {/* Title */}
          <div className="border-l-4 border-white pl-4 sm:pl-6 mb-4 py-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl">
              {title}
            </h1>
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mb-8 line-clamp-2">
              {description}
            </p>
          )}

          {/* Social Icons (Bottom Left) */}
          {showSocials && (
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[#262626]/50 max-w-xl">
              
              {/* Email */}
              {siteConfig.contactEmail && (
                <a href={`mailto:${siteConfig.contactEmail}`} aria-label="Mail" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] text-white transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </a>
              )}
              
              {/* Call */}
              {siteConfig.contactPhone && (
                <a href={`tel:${siteConfig.contactPhone?.replace(/[^0-9+]/g, "")}`} aria-label="Call" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] text-white transition-all duration-300">
                  <Phone className="w-4 h-4" />
                </a>
              )}
              
              {/* WhatsApp */}
              {siteConfig.whatsappNumber && (
                <a href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white hover:text-[#0A0A0A] text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.473s1.065 2.864 1.213 3.064c.149.198 2.095 3.2 5.077 4.487 2.982 1.286 2.982.846 3.528.796.545-.049 1.758-.718 2.005-1.411.248-.693.248-1.289.173-1.411-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.985-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}

              {/* Catalog Download */}
              <a href="/catalog.pdf" aria-label="Download Catalog" className="flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-[#0A0A0A] text-white transition-all duration-300 ml-auto sm:ml-0">
                <Download className="w-4 h-4" />
                <span>Catalog</span>
              </a>
            </div>
          )}
        </div>
        
        {/* RIGHT COLUMN: Big Icon within curved shape */}
        {icon && (
          <div className="hidden sm:flex justify-end items-center flex-shrink-0 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 text-white z-10 opacity-90 drop-shadow-lg scale-110 md:scale-125 lg:scale-150 origin-center transition-transform duration-500 hover:scale-[1.1] hover:rotate-2">
            {icon}
          </div>
        )}
      </div>
    </section>
  );
}
