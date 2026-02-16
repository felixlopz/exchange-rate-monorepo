---
name: react-native-design-system
description: Apply a clean, modern fintech/crypto design system to React Native screens using NativeWind (Tailwind CSS). Use this skill whenever updating, restyling, or creating new screens/components for the React Native app. Covers color palette, typography, spacing, card styles, charts, lists, navigation patterns, buttons, icons, and layout conventions derived from the reference design.
---

# React Native Design System — NativeWind / Tailwind CSS

This skill defines a comprehensive design system for a React Native app using **NativeWind** (Tailwind CSS for React Native). It is derived from the reference design in `reference/design-reference.png`.

> **IMPORTANT**: Before writing or modifying any component, review this entire document AND examine the reference image at `reference/design-reference.png` to internalize the visual language.

---

## 1. Design Philosophy

The design follows a **clean, airy, modern fintech** aesthetic:

- **Light-dominant** — white/off-white backgrounds with generous whitespace
- **Soft depth** — subtle shadows and rounded corners instead of hard borders
- **Information hierarchy** — large bold prices/values, smaller muted labels
- **Accent restraint** — navy/dark blue primary actions, orange secondary highlights, green/red for data changes
- **Card-based layout** — content grouped into soft rounded containers
- **Circular icon badges** — features and quick-actions shown as labeled circles with pastel backgrounds

---

## 2. Color Palette

Use these as your Tailwind theme colors in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Core
        background: '#F5F6FA',       // App background — very light gray-blue
        surface: '#FFFFFF',           // Cards, sheets, modals
        surfaceAlt: '#F0F1F6',       // Secondary surface / input backgrounds

        // Text
        textPrimary: '#1A1D2E',      // Headings, prices, bold values
        textSecondary: '#7B7F9E',    // Labels, descriptions, meta
        textTertiary: '#A9ADBD',     // Placeholders, disabled

        // Brand / Actions
        primary: '#1B2559',          // Primary buttons, FAB, nav active — dark navy
        primaryLight: '#2E3A7F',     // Hover/pressed state
        accent: '#F5A623',           // Orange accent — highlights, secondary badges
        accentLight: '#FFF3E0',      // Orange tint background for cards/badges
        accentBlue: '#3B82F6',       // Blue informational accent
        accentBlueLight: '#E8F0FE',  // Blue tint background

        // Semantic
        positive: '#22C55E',         // Green — gains, success, online status
        positiveLight: '#ECFDF5',    // Green tint background
        negative: '#EF4444',         // Red — losses, errors, alerts
        negativeLight: '#FEF2F2',    // Red tint background

        // Chart
        chartLine: '#3B82F6',        // Primary chart line color
        chartVolume: '#F5A623',      // Volume bar color

        // Navigation
        navInactive: '#A9ADBD',      // Inactive tab icons
        navActive: '#1B2559',        // Active tab icon + indicator

        // Borders & Dividers
        border: '#ECEDF2',           // Card borders, dividers
        borderLight: '#F5F6FA',      // Subtle separators
      },
    },
  },
};
```

---

## 3. Typography

The design uses a clean sans-serif typeface. Configure your font family (e.g., **SF Pro**, **Inter**, or **Poppins**) in `tailwind.config.js`:

```js
fontFamily: {
  sans: ['Poppins', 'System'],
  mono: ['SF Mono', 'Menlo'],
},
```

### Type Scale (use these Tailwind classes)

| Role                    | Tailwind Classes                                      | Example             |
|-------------------------|-------------------------------------------------------|---------------------|
| **Screen title**        | `text-2xl font-bold text-textPrimary`                 | "Home"              |
| **Section heading**     | `text-lg font-semibold text-textPrimary`              | "Top Movers"        |
| **Large price**         | `text-3xl font-bold text-textPrimary`                 | "$65,163.00"        |
| **Medium price**        | `text-xl font-bold text-textPrimary`                  | "$6,320.00"         |
| **Card title**          | `text-base font-semibold text-textPrimary`            | "Bitcoin"           |
| **Body / label**        | `text-sm text-textSecondary`                          | "MCap 1.648 T"     |
| **Small meta**          | `text-xs text-textTertiary`                           | "1 BTC"             |
| **Percentage gain**     | `text-sm font-semibold text-positive`                 | "+1.68%"            |
| **Percentage loss**     | `text-sm font-semibold text-negative`                 | "-2.65%"            |
| **Link / action text**  | `text-sm font-semibold text-accentBlue`               | "See all"           |

---

## 4. Spacing & Layout

### General Rules

- **Screen padding**: `px-5 pt-4` (20px horizontal, 16px top)
- **Section gap**: `mt-6` between major sections
- **Card internal padding**: `p-4`
- **List item padding**: `py-3 px-4`
- **Between cards in a row**: `gap-3`
- **Between list items**: separated by `border-b border-border`

### Screen Structure Pattern

```
<SafeAreaView className="flex-1 bg-background">
  <ScrollView className="flex-1 px-5 pt-4">
    {/* Header */}
    {/* Quick Actions Grid */}
    {/* Section: Top Movers */}
    {/* Section: Gainers & Losers */}
  </ScrollView>
  {/* Bottom Nav or FAB */}
</SafeAreaView>
```

---

## 5. Component Patterns

### 5.1 Cards

**Standard card** (white surface, rounded, subtle shadow):

```jsx
<View className="bg-surface rounded-2xl p-4 shadow-sm shadow-black/5">
  {/* Card content */}
</View>
```

**Highlighted / tinted card** (for featured items like top movers):

```jsx
{/* Orange tint card */}
<View className="bg-accentLight rounded-2xl p-4">
  <Text className="text-lg font-bold text-textPrimary">BTC $0.68</Text>
  <Text className="text-sm font-semibold text-positive">+99.87%</Text>
</View>

{/* Blue tint card */}
<View className="bg-accentBlueLight rounded-2xl p-4">
  {/* content */}
</View>
```

### 5.2 Crypto List Item

Each row in a coin list:

```jsx
<View className="flex-row items-center py-3 px-4 border-b border-border">
  {/* Coin icon */}
  <View className="w-10 h-10 rounded-full bg-accentLight items-center justify-center mr-3">
    <CoinIcon />
  </View>

  {/* Name + meta */}
  <View className="flex-1">
    <Text className="text-base font-semibold text-textPrimary">Bitcoin</Text>
    <Text className="text-xs text-textTertiary">1 BTC • 2.65%</Text>
  </View>

  {/* Mini chart sparkline area — 60x30 */}
  <View className="w-[60px] h-[30px] mx-3">
    <SparklineChart />
  </View>

  {/* Price + change */}
  <View className="items-end">
    <Text className="text-sm font-semibold text-textPrimary">$6,320.00</Text>
    <Text className="text-xs text-textSecondary">MCap 1.648 T</Text>
  </View>
</View>
```

### 5.3 Quick Action Circles (Home Grid)

Icon actions arranged in a grid (2 rows × 3 columns or scrollable):

```jsx
<View className="flex-row flex-wrap justify-between mt-4">
  {actions.map((action) => (
    <TouchableOpacity key={action.id} className="items-center w-[30%] mb-4">
      <View className="w-14 h-14 rounded-full bg-accentBlueLight items-center justify-center mb-2">
        <ActionIcon name={action.icon} size={24} color="#3B82F6" />
      </View>
      <Text className="text-xs text-textSecondary text-center">{action.label}</Text>
    </TouchableOpacity>
  ))}
</View>
```

### 5.4 Primary Button (FAB — Floating Action Button)

The design uses a prominent dark navy circular FAB:

```jsx
{/* Floating Action Button */}
<TouchableOpacity
  className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
>
  <PlusIcon size={24} color="#FFFFFF" />
</TouchableOpacity>
```

### 5.5 Secondary / Pill Buttons

Time range selectors and filter pills:

```jsx
{/* Active pill */}
<TouchableOpacity className="px-4 py-2 rounded-full bg-primary">
  <Text className="text-xs font-semibold text-white">24h</Text>
</TouchableOpacity>

{/* Inactive pill */}
<TouchableOpacity className="px-4 py-2 rounded-full bg-surfaceAlt">
  <Text className="text-xs font-semibold text-textSecondary">1Y</Text>
</TouchableOpacity>
```

### 5.6 Bottom Navigation Bar

```jsx
<View className="flex-row bg-surface border-t border-border py-2 px-6 justify-between items-center">
  {tabs.map((tab) => (
    <TouchableOpacity key={tab.id} className="items-center">
      <TabIcon
        name={tab.icon}
        size={22}
        color={tab.active ? '#1B2559' : '#A9ADBD'}
      />
      {tab.active && (
        <View className="w-1 h-1 rounded-full bg-primary mt-1" />
      )}
    </TouchableOpacity>
  ))}
</View>
```

### 5.7 Price Header (Detail Screen)

```jsx
<View className="px-5 pt-4">
  <Text className="text-sm text-textSecondary">Bitcoin Price</Text>
  <Text className="text-3xl font-bold text-textPrimary mt-1">$65,163.00</Text>
  <Text className="text-sm font-semibold text-positive mt-1">
    +$1,122.21 (3.04%)
  </Text>
</View>
```

### 5.8 Numeric Keypad

For wallet/send flows — circular soft buttons in a grid:

```jsx
<View className="flex-row flex-wrap justify-center gap-4 px-8">
  {[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map((key) => (
    <TouchableOpacity
      key={key}
      className="w-[72px] h-[72px] rounded-full bg-surfaceAlt items-center justify-center"
    >
      <Text className="text-xl font-semibold text-textPrimary">{key}</Text>
    </TouchableOpacity>
  ))}
</View>
```

### 5.9 QR Code Card (Receive Screen)

```jsx
<View className="bg-surface rounded-2xl p-6 items-center mx-5 shadow-sm shadow-black/5">
  <Text className="text-lg font-semibold text-textPrimary mb-4">Receive Bitcoin</Text>
  <View className="w-48 h-48 bg-white rounded-xl overflow-hidden">
    <QRCode value={address} size={192} />
  </View>
  <Text className="text-xs text-textTertiary mt-4 text-center">{address}</Text>
</View>
```

---

## 6. Charts

### Price Line Chart
- **Line color**: `#3B82F6` (chartLine)
- **Line width**: 2px
- **Fill**: Subtle gradient from `rgba(59,130,246,0.15)` to `transparent`
- **No grid lines** — clean minimal chart
- **Axis labels**: `text-xs text-textTertiary`

### Sparkline (List Items)
- **Green line** for positive trend, **red line** for negative
- **No axes, no labels** — pure line
- **Height**: 30px, **Width**: 60px

### Volume Bars
- **Color**: `#F5A623` (accent orange)
- **Background area**: transparent
- **Rounded tops** on bars

---

## 7. Shadows & Elevation

Use a restrained shadow system:

| Level        | Tailwind                              | Use Case                    |
|--------------|---------------------------------------|-----------------------------|
| **None**     | (no shadow)                           | Flat elements, list items   |
| **Subtle**   | `shadow-sm shadow-black/5`            | Cards, input fields         |
| **Medium**   | `shadow-md shadow-black/8`            | Modals, dropdowns           |
| **Strong**   | `shadow-lg shadow-primary/30`         | FAB, primary CTA            |

---

## 8. Icon Guidelines

- **Style**: Outlined / line icons (not filled) for nav and actions
- **Size**: 22–24px for nav, 20px for in-card actions, 16px for inline
- **Libraries**: Use `lucide-react-native` or `react-native-vector-icons` (Feather set)
- **Colors**: Match text hierarchy — `textPrimary` for active, `navInactive` for idle

---

## 9. Screen-by-Screen Guidance

When implementing any screen, follow this mapping:

### Home Screen
- Greeting header with avatar (top-right circular profile image)
- Quick actions grid (6 circular icon buttons with pastel backgrounds)
- "Top Movers" horizontal scroll of tinted cards
- "Gainers & Losers" vertical list with sparklines

### Coin List Screen
- Search bar at top (rounded, `bg-surfaceAlt`, search icon left)
- List of coins: icon → name/meta → sparkline → price/change
- FAB bottom-right for quick add

### Coin Detail Screen
- Back arrow + coin name header
- Large price display with change indicator
- Time range pills (`1h`, `24h`, `7d`, `30d`, `1Y`, `All`)
- Full-width price chart
- Market stats section (Market Cap, Volume, etc.) — key-value pairs
- Buy Crypto CTA button at bottom

### Send / Wallet Input Screen
- Large centered amount display
- "Bitcoin Wallet" label
- Numeric keypad with circular buttons
- "Continue" button (full-width, `bg-primary`, rounded-xl)

### Receive Screen
- Centered QR code card
- Address text below QR
- Share / Copy action buttons

---

## 10. Do's and Don'ts

### DO:
- Use `rounded-2xl` (16px) for cards, `rounded-full` for buttons/icons/avatars
- Keep backgrounds light (`bg-background` or `bg-surface`)
- Use generous spacing — let content breathe
- Show percentage changes in semantic colors (green/red)
- Use horizontal scrolling for featured/Top Mover cards
- Place primary actions in a dark navy FAB

### DON'T:
- Don't use heavy borders — prefer shadows and background color contrast
- Don't use more than 2 font weights per screen (typically `font-semibold` + `font-bold`)
- Don't overcrowd — if a screen feels dense, add more vertical spacing
- Don't use gradient backgrounds on the main app surface
- Don't use colored text for non-semantic purposes
- Don't mix icon styles (stick with outline/line icons throughout)

---

## 11. Animation Guidelines

- **Screen transitions**: Slide from right (default React Navigation)
- **List items**: Stagger fade-in on load (use `react-native-reanimated`)
- **Charts**: Animate draw-in from left to right on mount
- **FAB**: Scale-in with spring animation on screen load
- **Price changes**: Brief flash/pulse when values update in real-time
- **Pull to refresh**: Standard iOS/Android native behavior

---

## 12. Applying This Skill

When the user asks to update or create a screen:

1. **Identify the screen type** from Section 9
2. **Use the component patterns** from Section 5
3. **Apply the color palette** from Section 2
4. **Follow the typography scale** from Section 3
5. **Respect spacing rules** from Section 4
6. **Check Do's and Don'ts** from Section 10

Always produce complete, working NativeWind/Tailwind-styled components. Prefer composing from the patterns above rather than inventing new patterns that deviate from the design system.
