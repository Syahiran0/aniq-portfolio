/**
 * The dashboard is generated from this file.
 *
 * To make something editable:
 *   1. add it to src/content/content.json
 *   2. describe it here (a field in an existing section, or a whole new section)
 *   3. render it in a component with useContent()
 * No other dashboard code needs to change.
 *
 * Field types: text, url, textarea, image, file, color, tags, strings, toggle, select, group, list
 */

const field = (type) => (key, label, opts = {}) => ({ type, key, label, ...opts })

const text = field('text')
const url = field('url')
const textarea = field('textarea')
const image = field('image')
const file = field('file')
const color = field('color')
const tags = field('tags')
const strings = field('strings')
const toggle = field('toggle')
const group = (key, label, fields, opts = {}) => ({ type: 'group', key, label, fields, ...opts })
const list = (key, label, fields, opts = {}) => ({ type: 'list', key, label, fields, ...opts })

const links = list('links', 'Links', [text('label', 'Button label'), url('url', 'URL')], {
  itemTitle: (l) => l.label || l.url,
  addLabel: 'Add link',
})

/**
 * kind: 'object' -> content[id] is one object edited as a form
 * kind: 'list'   -> content[id] is an array; each entry is edited with `fields`
 * hasId          -> new entries get a unique id (used for React keys)
 */
export const SECTIONS = [
  {
    id: 'profile',
    label: 'Profile & contact',
    icon: 'User',
    kind: 'object',
    description: 'Who you are and how people reach you. Empty links are hidden from the site automatically.',
    fields: [
      text('name', 'Full name'),
      text('firstName', 'First name', { help: 'Used in short headings.' }),
      text('role', 'Role / title'),
      text('location', 'Location'),
      text('email', 'Email'),
      text('phone', 'Phone / WhatsApp', { help: 'Optional. Leave empty to keep your number off the site. Include the country code, e.g. +60123456789.' }),
      url('linkedin', 'LinkedIn URL'),
      url('github', 'GitHub URL'),
      image('photo', 'Profile photo', { help: 'Shown in the nav, the hero avatar and the About section. A portrait works best.' }),
      file('resumeUrl', 'Resume (PDF)', { help: 'Adds a Resume download button to the About and Contact sections.' }),
      text('availability', 'Availability line'),
    ],
  },
  {
    id: 'hero',
    label: 'Home hero',
    icon: 'Sparkles',
    kind: 'object',
    description: 'The big headline. It reads: [greeting] (photo) [name] / [lead] (blob) [highlight] / (project chip) [tail].',
    fields: [
      text('label', 'Top label'),
      text('greeting', 'Greeting'),
      text('name', 'Name in headline'),
      text('lead', 'Second line start'),
      text('highlight', 'Underlined words'),
      text('tail', 'Last line'),
      textarea('sub', 'Sub-heading', { rows: 3 }),
      text('chipLabel', 'Project chip label'),
      image('chipImage', 'Project chip image', { help: "Leave empty to use your first project's cover." }),
      text('connectLabel', 'Connect button label'),
      text('scrollHint', 'Scroll hint text'),
    ],
  },
  {
    id: 'stats',
    label: 'Stats strip',
    icon: 'BarChart3',
    kind: 'list',
    description: 'The row of big numbers under the hero.',
    itemTitle: (s) => [s.value, s.label].filter(Boolean).join(' · '),
    addLabel: 'Add stat',
    fields: [text('value', 'Big number', { placeholder: '3×' }), text('label', 'Label')],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'Layers',
    kind: 'list',
    hasId: true,
    description: 'Shown as the fan of cards and the index list. Click a card on the site to open the details.',
    itemTitle: (p) => p.title,
    itemSubtitle: (p) => p.subtitle,
    addLabel: 'Add project',
    defaults: { accent: '#ff6a1f' },
    fields: [
      text('title', 'Title'),
      text('label', 'Poster word', { help: 'Big word on the auto-generated cover. Leave empty to use the title.' }),
      text('subtitle', 'Subtitle'),
      text('role', 'Your role'),
      text('period', 'Event / period'),
      textarea('summary', 'Short summary', { rows: 3 }),
      strings('bullets', 'Highlights', { help: 'One point per line.' }),
      tags('stack', 'Tech stack', { help: 'Separate with commas.' }),
      image('cover', 'Cover image', { help: 'Leave empty for an auto-generated coloured poster.' }),
      color('accent', 'Accent colour'),
      links,
    ],
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: 'Trophy',
    kind: 'list',
    hasId: true,
    description: 'Cards marked "big stacked card" form the scrolling deck; the rest appear in the compact list below it. Order here = order on the site.',
    itemTitle: (a) => [a.rank, a.title].filter(Boolean).join(' · '),
    itemSubtitle: (a) => a.date,
    addLabel: 'Add achievement',
    defaults: { accent: '#ff7a1a', highlight: true },
    fields: [
      text('rank', 'Rank badge', { placeholder: 'Gold, 2nd, Top 20…' }),
      text('title', 'Competition / award'),
      text('date', 'Date'),
      textarea('description', 'Description', { rows: 3 }),
      image('image', 'Photo (optional)', { help: 'A photo of you receiving it works great on the big cards.' }),
      color('accent', 'Card colour'),
      toggle('highlight', 'Show as a big stacked card'),
    ],
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: 'BookOpen',
    kind: 'list',
    hasId: true,
    description: 'Longer write-ups that open in a pop-up. This is the place for your own voice.',
    itemTitle: (s) => s.title,
    itemSubtitle: (s) => s.kicker,
    addLabel: 'Add story',
    defaults: { accent: '#ff6a1f' },
    fields: [
      text('kicker', 'Small label above the title'),
      text('title', 'Title'),
      text('label', 'Poster word', { help: 'Big word on the auto-generated cover. Leave empty to pick one automatically.' }),
      text('date', 'Date / period'),
      textarea('excerpt', 'Teaser (shown on the card)', { rows: 2 }),
      strings('body', 'Story paragraphs', { multiline: true, help: 'One paragraph per box.' }),
      image('cover', 'Cover image'),
      color('accent', 'Accent colour'),
    ],
  },
  {
    id: 'about',
    label: 'About',
    icon: 'Smile',
    kind: 'object',
    description: 'The "Hi, this is me!" section. The photo comes from Profile & contact.',
    fields: [
      text('kicker', 'Small label'),
      text('title', 'Heading'),
      text('stickerText', 'Sticker text'),
      strings('paragraphs', 'Paragraphs', { multiline: true }),
      list('facts', 'Quick facts', [text('label', 'Label'), text('value', 'Value')], {
        itemTitle: (f) => [f.label, f.value].filter(Boolean).join(': '),
        addLabel: 'Add fact',
      }),
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: 'Briefcase',
    kind: 'list',
    hasId: true,
    itemTitle: (e) => e.role,
    itemSubtitle: (e) => e.org,
    addLabel: 'Add experience',
    fields: [
      text('role', 'Role'),
      text('org', 'Company'),
      text('location', 'Location'),
      text('period', 'Period'),
      strings('bullets', 'What you did', { multiline: true }),
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'GraduationCap',
    kind: 'list',
    hasId: true,
    itemTitle: (e) => e.degree,
    itemSubtitle: (e) => e.school,
    addLabel: 'Add education',
    fields: [text('degree', 'Degree / programme'), text('school', 'School'), text('period', 'Period'), strings('details', 'Details', { multiline: true })],
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: 'BadgeCheck',
    kind: 'list',
    hasId: true,
    itemTitle: (c) => c.title,
    itemSubtitle: (c) => c.issuer,
    addLabel: 'Add certification',
    defaults: { accent: '#2f6bff' },
    fields: [
      text('title', 'Certificate name'),
      text('issuer', 'Issuer'),
      text('date', 'Date'),
      textarea('description', 'Extra note', { rows: 2 }),
      url('url', 'Credential link'),
      image('image', 'Certificate image (optional)'),
      color('accent', 'Accent colour'),
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: 'Wrench',
    kind: 'list',
    itemTitle: (g) => g.group,
    addLabel: 'Add skill group',
    fields: [text('group', 'Group name'), tags('items', 'Skills', { help: 'Separate with commas.' })],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: 'Users',
    kind: 'list',
    hasId: true,
    itemTitle: (l) => l.role,
    itemSubtitle: (l) => l.org,
    addLabel: 'Add activity',
    fields: [text('role', 'Role'), text('org', 'Organisation / event'), text('period', 'Period'), textarea('detail', 'Detail', { rows: 2 })],
  },
  {
    id: 'gallery',
    label: 'Photo gallery',
    icon: 'Image',
    kind: 'list',
    hasId: true,
    description: 'Photos of competitions, demos and events. The section stays hidden until you add one.',
    itemTitle: (g) => g.caption || 'Photo',
    addLabel: 'Add photo',
    fields: [image('image', 'Photo'), text('caption', 'Caption')],
  },
  {
    id: 'connect',
    label: 'Contact section',
    icon: 'Mail',
    kind: 'object',
    fields: [
      text('title', 'Heading'),
      textarea('text', 'Text', { rows: 3 }),
      text('emailSubject', 'Default email subject'),
      text('footerNote', 'Footer note'),
    ],
  },
  {
    id: 'site',
    label: 'Site settings',
    icon: 'Settings2',
    kind: 'object',
    description: 'Browser-tab title, search description, and which sections are visible.',
    fields: [
      text('title', 'Page title'),
      textarea('description', 'Search / share description', { rows: 3 }),
      group(
        'sections',
        'Visible sections',
        [
          toggle('stats', 'Stats strip'),
          toggle('work', 'Work'),
          toggle('achievements', 'Achievements'),
          toggle('about', 'About'),
          toggle('stories', 'Stories'),
          toggle('journey', 'Journey (experience & education)'),
          toggle('certifications', 'Certifications'),
          toggle('skills', 'Skills'),
          toggle('leadership', 'Leadership'),
          toggle('gallery', 'Photo gallery'),
          toggle('connect', 'Contact'),
        ],
        { inline: true },
      ),
    ],
  },
]

/** An empty value for a field, used when adding a new list entry. */
export function blankValue(f) {
  switch (f.type) {
    case 'tags':
    case 'strings':
    case 'list':
      return []
    case 'toggle':
      return false
    case 'color':
      return '#ff6a1f'
    case 'group':
      return Object.fromEntries(f.fields.map((x) => [x.key, blankValue(x)]))
    default:
      return ''
  }
}

export function blankItem(fields, defaults = {}, withId = false) {
  const item = Object.fromEntries(fields.map((f) => [f.key, blankValue(f)]))
  if (withId) item.id = `item-${Math.random().toString(36).slice(2, 8)}`
  return { ...item, ...defaults }
}
