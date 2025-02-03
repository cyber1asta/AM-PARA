import React, { useRef, useState } from 'react';

const MyComponent = () => {
    const elementRef = useRef(null);
    const [isElementVisible, setIsElementVisible] = useState(false);

    const showHandler = () => {
        setIsElementVisible(true); // غير الحالة فقط، و React غيحدث الواجهة تلقائيًا
    };

    return (
        <div>
            <button onClick={showHandler}>Show Element</button>
            {/* العنصر لي غيبان */}
            {isElementVisible && (
                <div ref={elementRef}>
                    This is the element that will be shown.
                </div>
            )}
        </div>
    );
};

export default MyComponent;
