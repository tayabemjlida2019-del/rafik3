import React from 'react';
import { View, Text } from 'react-native';
import { Compass } from 'lucide-react-native';

interface BrandLogoProps {
  size?: 'small' | 'default' | 'large';
  variant?: 'full' | 'icon';
}

export default function BrandLogo({ size = 'default', variant = 'full' }: BrandLogoProps) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  const iconSize = isSmall ? 24 : isLarge ? 48 : 32;
  const arFontSize = isSmall ? 16 : isLarge ? 32 : 24;
  const enFontSize = isSmall ? 8 : isLarge ? 12 : 10;
  
  return (
    <View className="flex-row items-center">
      {/* Golden Compass Icon */}
      <View className="bg-primary-dark rounded-xl p-1.5 border border-white/10 shadow-lg shadow-black/30">
        <Compass size={iconSize} color="#C6A75E" strokeWidth={2.5} />
      </View>
      
      {variant === 'full' && (
        <View className="mr-3 items-end">
          <Text 
            className="font-black text-white" 
            style={{ fontSize: arFontSize }}
          >
            الرفيق
          </Text>
          <Text 
            className="font-bold text-accent uppercase tracking-[0.3em]" 
            style={{ fontSize: enFontSize, opacity: 0.8, marginTop: -2 }}
          >
            RAFIIK
          </Text>
        </View>
      )}
    </View>
  );
}
