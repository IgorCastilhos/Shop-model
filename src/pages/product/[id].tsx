import { stripe } from '@/lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/styles/pagesStyles/product'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import Stripe from 'stripe'

interface ProductProps {
  product: {
    id: string
    name: string
    imageURL: string
    price: string
    description: string
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductProps) {
  function handleBuyProduct() {
    console.log(product.defaultPriceId)
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageURL} width={520} height={480} alt="" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>

        <p>{product.description}</p>

        <button onClick={handleBuyProduct}>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  )
}

// Método que devolve os Id's do getStaticProps
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: 'prod_NeUNXBBYu4WEJT' } }],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  if (!params) {
    return {
      notFound: true, // Caso não exista parâmetros, retorna um 404
    }
  }

  const productId = params.id

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageURL: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount ? price.unit_amount / 100 : 0),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}
