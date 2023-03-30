import styled from 'styled-components'
import {Divider, Tag, Space} from 'antd'
interface ISamples {
    list: any
    onSetListIndex: any
    currentIndex: number
}

const Samples: React.FC<ISamples> = ({
    onSetListIndex,
    currentIndex,
    list
}) => {
    const onSelect = (index: number) => {
        onSetListIndex(index)
    }

    return <SamplesContainer>
        <Divider orientation="left">DataList</Divider>
        <Space size={[0, 8]} wrap>
            {
                list.map((item: any, index: number) => {
                    return <Tag key={item.key} color={
                        currentIndex === index ? "green" : ""
                    }
                        onClick={() => onSelect(index)}
                        className="tags"
                    >
                        {item.name}
                    </Tag>
                })
            }
        </Space>
    </SamplesContainer>
}

export default Samples

const SamplesContainer = styled.div`
    display: flex;
    flex-direction: column;

    .tags {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px
    }
`