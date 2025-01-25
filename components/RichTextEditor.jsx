'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export default function RichTextEditor({ value, onChange, glossaryTerms = [], className = '' }) {
  const editorRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [flagType, setFlagType] = useState('');
  const [flagComment, setFlagComment] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    if (isPreview && value) {
      renderMarkdown(value);
    }
  }, [value, isPreview]);

  const renderMarkdown = async (content) => {
    try {
      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .process(content);

      setRenderedContent(String(result));
    } catch (error) {
      console.error('Error rendering markdown:', error);
    }
  };

  const handleInit = (evt, editor) => {
    editorRef.current = editor;
    
    // Add Markdown shortcuts
    editor.ui.registry.addButton('markdownguide', {
      text: 'Markdown Guide',
      onAction: () => {
        editor.windowManager.open({
          title: 'Markdown Guide',
          body: {
            type: 'panel',
            items: [{
              type: 'htmlpanel',
              html: `
                <div style="padding: 10px;">
                  <h3>Basic Syntax</h3>
                  <pre>
# Heading 1
## Heading 2
**bold**
*italic*
[link](url)
![image](url)
> blockquote
\`code\`
\`\`\`
code block
\`\`\`
- list item
1. numbered item
                  </pre>
                </div>
              `
            }]
          },
          buttons: [{ type: 'cancel', text: 'Close' }]
        });
      }
    });

    // Add custom context menu for flagging text
    editor.ui.registry.addContextMenu('textflag', {
      update: (element) => {
        const selected = editor.selection.getContent();
        if (selected && selected.length > 0) {
          setSelectedText(selected);
          return [
            {
              type: 'item',
              text: 'Flag Text',
              icon: 'warning',
              onAction: () => setShowFlagMenu(true)
            }
          ];
        }
        return [];
      }
    });

    // Add custom button for inserting glossary terms
    editor.ui.registry.addButton('glossaryterms', {
      text: 'Insert Term',
      onAction: () => {
        const terms = glossaryTerms.map(term => ({
          text: term.term,
          value: term.term_id
        }));

        editor.windowManager.open({
          title: 'Insert Glossary Term',
          body: {
            type: 'selectbox',
            name: 'term',
            label: 'Select Term',
            items: terms
          },
          onSubmit: (api) => {
            const termId = api.getData().term;
            const term = glossaryTerms.find(t => t.term_id === termId);
            if (term) {
              editor.insertContent(`[[${term.term}]]`);
            }
            api.close();
          }
        });
      }
    });

    // Add button for section linking
    editor.ui.registry.addButton('sectionlink', {
      text: 'Link to Section',
      onAction: () => {
        // Extract headings from current content
        const content = editor.getContent();
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches = [...content.matchAll(headingRegex)];
        const sections = matches.map(match => ({
          text: match[2],
          value: match[2]
        }));

        if (sections.length === 0) {
          editor.notificationManager.open({
            text: 'No sections found in the document',
            type: 'warning'
          });
          return;
        }

        editor.windowManager.open({
          title: 'Link to Section',
          body: {
            type: 'selectbox',
            name: 'section',
            label: 'Select Section',
            items: sections
          },
          onSubmit: (api) => {
            const section = api.getData().section;
            editor.insertContent(`[[#${section}]]`);
            api.close();
          }
        });
      }
    });

    // Update toolbar configuration
    const toolbarConfig = editor.settings.toolbar;
    editor.settings.toolbar = toolbarConfig.replace(
      'glossaryterms',
      'glossaryterms sectionlink'
    );
  };

  const handleFlagSubmit = async () => {
    if (!selectedText || !flagType) return;

    try {
      const selection = editorRef.current.selection;
      const range = selection.getRng();
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      await fetch('/api/articles/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startOffset,
          endOffset,
          flagType,
          comment: flagComment
        })
      });

      // Add visual indicator for flagged text
      const flaggedContent = `<span class="flagged-text" style="background-color: rgba(255, 235, 59, 0.2);" data-flag-type="${flagType}">${selectedText}</span>`;
      selection.setContent(flaggedContent);

    } catch (error) {
      console.error('Error submitting flag:', error);
    } finally {
      setShowFlagMenu(false);
      setFlagType('');
      setFlagComment('');
    }
  };

  if (isPreview) {
    return (
      <div className={className}>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsPreview(false)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            Edit Mode
          </button>
        </div>
        <div 
          className="prose prose-invert max-w-none p-4 bg-black"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsPreview(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 transition-colors"
        >
          Preview Mode
        </button>
      </div>
      <Editor
        onInit={handleInit}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
            'codesample'
          ],
          toolbar: 'markdownguide | undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | glossaryterms | codesample | help',
          content_style: `
            body { 
              font-family: 'Fira Code', monospace;
              font-size: 16px;
              color: #d1d5db;
              background-color: #000;
              line-height: 1.6;
            }
            .glossary-term {
              color: #d97706;
              text-decoration: none;
              border-bottom: 1px dashed #d97706;
            }
            .flagged-text {
              position: relative;
              cursor: help;
            }
            pre {
              background-color: #1f2937;
              padding: 1em;
              border-radius: 4px;
            }
          `,
          contextmenu: 'textflag'
        }}
      />

      {showFlagMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl text-amber-500 mb-4">Flag Text</h3>
            <select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none mb-4"
            >
              <option value="">Select Flag Type</option>
              <option value="Vague">Vague</option>
              <option value="Inaccurate">Inaccurate</option>
              <option value="Citation Needed">Citation Needed</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              value={flagComment}
              onChange={(e) => setFlagComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowFlagMenu(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Collaborative editing setup
import { collab, receiveUpdates, sendUpdates } from 'prosemirror-collab';

function setupCollaboration(editorView, version) {
    const collaboration = collab({ version });
    
    // Listen for WebSocket updates
    socket.on('patch', (update) => {
        const newState = receiveUpdates(editorView.state, update);
        editorView.updateState(newState);
    });
    
    // Send local updates
    editorView.dispatch(
        editorView.state.tr.setMeta(collaboration, {
            type: 'UPDATE',
            data: sendUpdates(editorView.state)
        })
    );
} 