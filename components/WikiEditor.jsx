import React, { useState, useRef } from 'react';

function TextHighlighter({ content, flags }) {
    const [selection, setSelection] = useState(null);
    const contentRef = useRef(null);

    const handleTextSelect = (e) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(contentRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        
        const start = preSelectionRange.toString().length;
        const end = start + selection.toString().length;
        
        setSelection({ start, end });
    };

    return (
        <div 
            ref={contentRef}
            onMouseUp={handleTextSelect}
            className="relative article-content"
        >
            {flags.map(flag => (
                <FlagPopup 
                    key={flag.flag_id}
                    start={flag.start_offset}
                    end={flag.end_offset}
                    color={flag.color_code}
                    comment={flag.comment}
                />
            ))}
            {content}
            {selection && <FlagSubmissionForm selection={selection} />}
        </div>
    );
}

const FlagPopup = React.memo(({ start, end, color, comment }) => {
    // Implementation for hover-delayed popup with animations
}); 