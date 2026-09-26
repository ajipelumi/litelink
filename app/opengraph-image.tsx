import {ImageResponse} from 'next/og'

export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #171717, #2a1710 60%, #ea580c22)',
          color: '#f5f5f5',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: '7px solid #EA580C',
            }}
          />
          <span style={{fontSize: 40, fontWeight: 600}}>LiteLink</span>
        </div>
        <div style={{fontSize: 56, fontWeight: 600, textAlign: 'center', maxWidth: 900}}>
          See what a page actually costs to load
        </div>
        <div style={{fontSize: 24, marginTop: 24, color: '#d4d4d4', textAlign: 'center', maxWidth: 800}}>
          Compare full page weight vs. a stripped, ad-free version
        </div>
      </div>
    ),
    size,
  )
}
