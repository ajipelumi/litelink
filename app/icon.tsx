import {ImageResponse} from 'next/og'

export const size = {width: 64, height: 64}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#171717',
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            border: '5px solid #EA580C',
          }}
        />
      </div>
    ),
    size,
  )
}
