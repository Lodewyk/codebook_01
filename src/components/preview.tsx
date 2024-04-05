import { useEffect, useRef } from "react";
import './preview.css';

interface PreviewProps {
    code: string;
}

/*
 * code that will go into the iframe to eval() whatever the user submits
 *
 */
const html = `
<html>
<head>
<style>html { background-color: #fff;}</style>
</head>
<body>
    <div id="root"></div>
    <script>
        window.addEventListener('message', (event) => { 
            try {
                eval(event.data);
            } catch (err) {
                const root = document.querySelector('#root');
                root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
                console.error(err);
            }
        }, false);
    </script>
</body
</html>
`;

const Preview: React.FC<PreviewProps> = ({code}) => {
    const iframe = useRef<any>();

    useEffect(() => {
        // resets the iframe srcdoc to prevent the user from nuking it by accident
        iframe.current.srcdoc = html;

        setTimeout(() => {
            // using the iframe ref we're posting the code to the iframe 
            iframe.current.contentWindow.postMessage(code, '*');
        }, 50);
    }, [code])
    

    return (
       <div className="preview-wrapper">
            {/*  
              * need to use an iframe to show the code to solve the following issues (that i've found so far):
              * 
              * - code has errors
              * - prevent user from manipulating the DOM
              * 
              * #ideaTotallyStolenFromCodepen.io
              * 
              * Just using the sandbox property though, not serving from separate domains.
              * User wont be able to user localStorage.
              */}
            <iframe title="code-preview" ref={iframe} sandbox="allow-scripts" srcDoc={html} />
       </div>
    );
}

export default Preview;