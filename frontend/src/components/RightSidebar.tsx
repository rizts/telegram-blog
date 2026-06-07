import { ChannelStats } from './widgets/ChannelStats';
import { TagCloud } from './widgets/TagCloud';
import { AnnouncementWidget } from './widgets/AnnouncementWidget';
import { SocialLinksWidget } from './widgets/SocialLinksWidget';
import { SearchWidget } from './widgets/SearchWidget';
import { PopularPostsWidget } from './widgets/PopularPostsWidget';
import RadioPlayer from './RadioPlayer';

interface Props {
  hasRadio: boolean;
  radioStreamUrl: string;
  hasAndroid: boolean;
  androidUrl: string;
  hasIos: boolean;
  iosUrl: string;
}

export function RightSidebar({ hasRadio, radioStreamUrl, hasAndroid, androidUrl, hasIos, iosUrl }: Props) {
  const announcement = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT || '';
  const instagram = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '';
  const youtube = process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '';
  const xUrl = process.env.NEXT_PUBLIC_SOCIAL_X || '';
  const facebook = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '';

  return (
    <aside style={{ width: '100%', minWidth: '300px' }}>
      <SearchWidget />
      <AnnouncementWidget text={announcement} />
      <ChannelStats />
      <PopularPostsWidget />
      <TagCloud />
      <SocialLinksWidget instagram={instagram} youtube={youtube} xUrl={xUrl} facebook={facebook} />

      {/* App Download Links in Sidebar */}
      {(hasAndroid || hasIos) && (
        <div style={{
          background: 'rgba(255, 255, 245, 0.82)',
          border: '1px solid rgba(210, 195, 150, 0.35)',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '24px',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 1px 6px rgba(100, 80, 20, 0.06)',
        }}>
          <h3 style={{
            fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)',
            marginBottom: '16px', borderBottom: '1px solid rgba(210, 195, 150, 0.3)',
            paddingBottom: '10px'
          }}>
            Download Aplikasi Kami
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hasAndroid && (
              <a
                href={androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Download Android App"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: 600, padding: '12px 16px',
                  borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(139, 105, 20, 0.08)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(139, 105, 20, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.6 9c-.2-1.1-.9-2-1.8-2.6L17 4.2c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.3 2.4c-1-.4-2-.6-3-.6s-2 .2-3 .6L7.6 3.8c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.2 2.2c-.9.6-1.6 1.5-1.8 2.6H17.6M9 8c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5m6 0c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5M5 10v6c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-6H5m3 8v3c0 .6-.4 1-1 1s-1-.4-1-1v-3h2m10 0v3c0 .6-.4 1-1 1s-1-.4-1-1v-3h2M4.5 10v5c0 .6-.4 1-1 1s-1-.4-1-1v-5c0-.6.4-1 1-1s1 .4 1 1m16 0v5c0 .6-.4 1-1 1s-1-.4-1-1v-5c0-.6.4-1 1-1s1 .4 1 1" />
                </svg>
                Google Play Store
              </a>
            )}
            {hasIos && (
              <a
                href={iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Download iOS App"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: 600, padding: '12px 16px',
                  borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(139, 105, 20, 0.08)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(139, 105, 20, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19C14.1 6.13 12.8 6.75 12 6.75c-.15-1.12.38-2.38 1-3.25z" />
                </svg>
                Apple App Store
              </a>
            )}
          </div>
        </div>
      )}

      {/* Embedded Radio Player */}
      {hasRadio && (
        <div style={{ marginBottom: '24px' }}>
          <RadioPlayer streamUrl={radioStreamUrl} />
        </div>
      )}
    </aside>
  );
}
