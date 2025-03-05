import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useTranslation } from "react-i18next";

type BrandsCardProps = {
  photo?: string;
  name: string;
  icon?: string;
  variant?: 'default' | 'large';
};

export default function BrandsCard({ name, variant = 'default', photo }: BrandsCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('allBrands');

  const handleClick = () => {
    const urlBrandName = name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sneakerFinder/${urlBrandName}/products`);
  };

  const cardClasses = variant === 'large' 
    ? "relative flex flex-col items-center justify-end w-72 h-40 rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
    : "relative flex flex-col items-center justify-end w-[350px] h-24 rounded-sm shadow-sm";

  const cardStyle = photo ? {
    backgroundImage: `url(${photo})`,
    backgroundPosition: 'center',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div className={cardClasses} style={cardStyle}>
      <Button 
        name={t('viewProducts')}
        type="button"
        className={variant === 'large' ? "!w-2/3 !py-1 !px-4 !text-sm mb-2 !rounded-sm" : "!w-auto !py-1 !px-3 !text-sm mb-1 !rounded-sm"}
        onClick={handleClick}
      />
    </div>
  );
}
