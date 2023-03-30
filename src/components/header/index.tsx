import styled from 'styled-components'
import {Button, message} from 'antd'
import React, {useRef, useState} from 'react';
import {samplesFactory} from '../../utils/samples';

interface IHeader {
    setList: any
    list: any[]
}
const Header: React.FC<IHeader> = ({setList, list}) => {
    function App() {
        const [isDragging, setIsDragging] = useState(false);
        const uploadFileRef = useRef<HTMLInputElement>()

        function handleDragEnter(event: React.DragEvent) {
            event.preventDefault();
            setIsDragging(true);
        }

        function handleDragLeave(event: React.DragEvent) {
            event.preventDefault();
            setIsDragging(false);
        }

        function handleDrop(event: React.DragEvent) {
            event.preventDefault();
            setIsDragging(false);
            const files = event.dataTransfer.files;
            handleFiles(files);
        }

        function onchange(event: any) {
            if (uploadFileRef.current) {
                handleFiles(uploadFileRef.current.files)
            }
        }

        function handleFiles(files: any) {
            for (const file of files) {
                // 在这里处理文件内容
                const {name, type} = file
                if (type !== "application/json") {
                    message.error("Please upload data in json-self-profiling format")
                    continue
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const data = JSON.parse(reader.result as string);
                    const sample = samplesFactory(name, data)
                    setList((prev: any) => {
                        return [...prev, sample]
                    })
                };
                reader.readAsText(file);
            }
        }

        return (
            <Button
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                type="dashed"
                style={{
                    textAlign: 'center',
                }}
            >
                <div className="upload-container">
                    <label htmlFor="file-upload" className="upload-btn">Select/Drag File</label>
                    <input id="file-upload" type="file" name="file" onChange={onchange}
                        multiple
                        ref={uploadFileRef as any} />
                </div>
            </Button>
        );
    }


    return <HeaderContainer>
        <div className="header-logo">
            <div className='header-title'>js-self-profiling-frame-graph</div>
            <div className='header-desc'>A framework that parses the JSON exported by js-self-profiling-api into a flame graph</div>
        </div>
        <div>
            <App />
        </div>
    </HeaderContainer>
}

const HeaderContainer = styled.div`
    display:flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ccc;

    .header-logo {
        .header-title {
            font-size: 16px;
        }

        .header-desc {
            font-size: 12px;
            color: rgb(113 105 105);
        }
    }

    /* 隐藏默认的文件选择按钮 */
    input[type="file"] {
      display: none;
    }
    
    /* 自定义文件选择按钮 */
    .upload-btn {
      display: inline-block;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    
    
    /* 将自定义按钮与文件名称组合在一起 */
    .upload-container {
      position: relative;
      display: inline-block;
      width: 100%;
      height: 100%;
    }
    
    .upload-container input[type="file"] {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
`

export default Header