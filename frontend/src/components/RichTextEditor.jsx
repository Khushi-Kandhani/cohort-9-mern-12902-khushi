import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

// toolbar buttons - kept it minimal, only what the assignment actually needs
const TOOLBAR_BUTTONS = [
  { action: 'toggleBold', check: 'bold', icon: Bold, label: 'Bold' },
  { action: 'toggleItalic', check: 'italic', icon: Italic, label: 'Italic' },
  { action: 'toggleBulletList', check: 'bulletList', icon: List, label: 'Bullet list' },
  { action: 'toggleOrderedList', check: 'orderedList', icon: ListOrdered, label: 'Numbered list' },
];

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-slate-100',
      },
    },
  });

  // editor takes a tick to initialize, don't render toolbar until it's ready
  if (!editor) {
    return null;
  }

  const runToolbarAction = (actionName) => {
    editor.chain().focus()[actionName]().run();
  };

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition overflow-hidden">
      <div className="flex items-center gap-1 border-b border-slate-700 px-2 py-1.5 bg-slate-900/50">
        {TOOLBAR_BUTTONS.map(({ action, check, icon: Icon, label }) => {
          const active = editor.isActive(check);
          return (
            <button
              key={action}
              type="button"
              onClick={() => runToolbarAction(action)}
              aria-label={label}
              aria-pressed={active}
              className={
                'p-1.5 rounded-md transition cursor-pointer ' +
                (active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800')
              }
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
