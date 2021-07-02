import { initializeApollo } from 'lib/apolloClient';
import { ALL_PIZZAS, FOOTER_BANNER, HERO, LOGO } from 'lib/queries';
import { AllPizzas } from 'types/AllPizzas';
import { Logo } from 'types/Logo';
import { Hero, FooterBanner, PizzaList } from 'components';
import { Hero as THero } from 'types/Hero';
import { FooterBanner as TFooterBanner } from 'types/FooterBanner';
import { GetStaticProps } from 'next';

type HomePageProps = {
  pizzas: AllPizzas;
  logo: Logo;
  hero: THero;
  footerBanner: TFooterBanner;
};

const HomePage: React.FC<HomePageProps> = props => {
  return (
    <>
      <Hero data={props.hero} />
      <PizzaList data={props.pizzas} />
      <FooterBanner data={props.footerBanner} />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initializeApollo();

  const { data: pizzas } = await apolloClient.query({
    query: ALL_PIZZAS,
  });

  await apolloClient.query({
    query: LOGO,
  });

  const { data: hero } = await apolloClient.query({
    query: HERO,
  });

  const { data: footerBanner } = await apolloClient.query({
    query: FOOTER_BANNER,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      pizzas,
      hero,
      footerBanner,
    },
  };
};
