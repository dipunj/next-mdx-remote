import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createContext, useEffect, useState } from 'react'
import renderToString from '../../../../render-to-string'
import hydrate from '../../../../hydrate'
import Test from '../components/test'
import { paragraphCustomAlerts } from '@hashicorp/remark-plugins'

const TestContext = createContext('test')
const PROVIDER = {
  component: TestContext.Provider,
  props: { value: 'foo' },
}
const MDX_COMPONENTS = {
  Test,
  ContextConsumer: () => {
    return (
      <TestContext.Consumer>
        {(value) => <p className="context">Context value: "{value}"</p>}
      </TestContext.Consumer>
    )
  },
  strong: (props) => <strong className="custom-strong" {...props} />,
}

export default function TestPage({ data, mdxSource }) {
  const [providerOptions, setProviderOptions] = useState(PROVIDER)

  useEffect(() => {
    setProviderOptions({
      ...PROVIDER,
      props: {
        value: 'bar',
      },
    })
  }, [])

  const { content } = hydrate(mdxSource, {
    components: MDX_COMPONENTS,
    provider: providerOptions,
  })

  return (
    <>
      <h1>{data.title}</h1>
      {content}
    </>
  )
}

export async function getStaticProps() {
  const fixturePath = path.join(process.cwd(), 'mdx/test.mdx')
  const { data, content } = matter(fs.readFileSync(fixturePath, 'utf8'))
  const mdxSource = await renderToString(content, {
    components: MDX_COMPONENTS,
    provider: PROVIDER,
    mdxOptions: { remarkPlugins: [paragraphCustomAlerts] },
    scope: data,
  })
  return { props: { mdxSource, data } }
}
