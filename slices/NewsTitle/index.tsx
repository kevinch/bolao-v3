import { Content } from "@prismicio/client"
import { SliceComponentProps } from "@prismicio/react"

/**
 * Props for `NewsTitle`.
 */
export type NewsTitleProps = SliceComponentProps<Content.NewsTitleSlice>

/**
 * Component for "NewsTitle" Slices.
 */
const NewsTitle = ({ slice }: NewsTitleProps) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for news_title (variation: {slice.variation}) Slices
    </section>
  )
}

export default NewsTitle
