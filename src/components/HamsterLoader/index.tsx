import styles from './HamsterLoader.module.css'

const HamsterLoader = (props: any) => {
    const {loaderTitle} = props; 
    return (
        <div aria-label='Orange and tan hamster running in a metal wheel' role='img' className={`${styles.wheel_and_hamster} rounded-full p-6`}>
            <h1 className='flex justify-center text-lg font-bold'>{loaderTitle}</h1>
            <div className={`${styles.wheel}`}></div>
            <div className={`${styles.hamster}`}>
                <div className={`${styles.hamster__body}`}>
                    <div className={`${styles.hamster__head}`}>
                        <div className={`${styles.hamster__ear}`}></div>
                        <div className={`${styles.hamster__eye}`}></div>
                        <div className={`${styles.hamster__nose}`}></div>
                    </div>
                    <div className={`${styles.hamster__limb} ${styles.hamster__limb__fr}`}></div>
                    <div className={`${styles.hamster__limb} ${styles.hamster__limb__fl}`}></div>
                    <div className={`${styles.hamster__limb} ${styles.hamster__limb__br}`}></div>
                    <div className={`${styles.hamster__limb} ${styles.hamster__limb__bl}`}></div>
                    <div className={`${styles.hamster__tail}`}></div>
                </div>
            </div>
            <div className={`${styles.spoke}`}></div>
        </div>
    );
};
export default HamsterLoader;