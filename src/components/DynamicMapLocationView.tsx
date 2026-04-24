'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const MapLocationView = dynamic(() => import('./MapLocationView'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-muted/20 animate-pulse border-2 border-border/50 flex flex-col items-center justify-center font-bold text-muted-foreground text-xs tracking-widest uppercase">Se încarcă Harta...</div> 
})

export default function DynamicMapLocationView(props: any) {
  return <MapLocationView {...props} />
}
