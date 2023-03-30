import styled from 'styled-components'
import {Card, Empty, Descriptions} from 'antd'

const ChartDetail: React.FC<any> = ({
    data
}) => {
    const {
        info,
        duration,
        start,
    } = data || {}
    const {
        column, line, name, resourceURI
    } = info || {}

    return <ChartDetailContainer>
        {data ? <Descriptions title="Select Data" bordered
            column={1} className="descContainer">
            <Descriptions.Item label="column">{column}</Descriptions.Item>
            <Descriptions.Item label="line">{line}</Descriptions.Item>
            <Descriptions.Item label="resourceURI">{resourceURI}</Descriptions.Item>
            <Descriptions.Item label="name">{name}</Descriptions.Item>
            <Descriptions.Item label="duration">{duration}</Descriptions.Item>
            <Descriptions.Item label="start">{start}</Descriptions.Item>
        </Descriptions>
            : <Empty description={"Not Select"} />}
    </ChartDetailContainer>
}

export default ChartDetail

const ChartDetailContainer = styled.div`
    height: 100%;
    .descContainer {
        margin-left: 10px;
    }
`