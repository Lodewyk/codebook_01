import { ResizableBox, ResizableBoxProps } from "react-resizable";
import './resizable.css';
import { useEffect, useState } from 'react';

interface ResizableProps {
    direction: "horizontal" | "vertical";
    children?: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
    let resizableProps: ResizableBoxProps;
    const [innerHeight, setInnerHeight] = useState(window.innerHeight);
    const [innerWidth, setInnerWidth] = useState(window.innerWidth);
    const [width, setWidth] = useState(window.innerWidth * 0.75); // used to sync window and preview width

    useEffect(() => {
        let timer: any; // used to prevent the browser from recalculating the heights and widths constantly
        const listener = () => {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                setInnerHeight(window.innerHeight);
                setInnerWidth(window.innerWidth);
                // fix bug with resizable box where providing a width makes it ignore the min/max constraints
                if (window.innerWidth * 0.75 < width) {
                    setWidth(window.innerWidth * 0.75)
                }
            }, 100);
        }
        window.addEventListener('resize', listener);

        return () => {
            window.removeEventListener('resize', listener);
        }
    }, []);

    if (direction === 'horizontal') {
        resizableProps = {
            className: 'resize-horizontal',
            minConstraints: [window.innerWidth * 0.2, Infinity],
            maxConstraints: [window.innerWidth * 0.75, Infinity],
            height: Infinity,
            width: window.innerWidth * 0.75,
            resizeHandles: ['e'],
            onResizeStop: (event, data) => {
                setWidth(data.size.width);
            }
        };
    } else {
        resizableProps = {
            minConstraints: [Infinity, 40],
            maxConstraints: [Infinity, window.innerHeight * 0.9],  // prevent vertical dragging from going more than 90% window height
            height: 300,
            width: Infinity, // take up as much horizontal space as possible
            resizeHandles: ['s'],
        };
    }

    return <ResizableBox {...resizableProps}>
        {children}
    </ResizableBox>;
};

export default Resizable;