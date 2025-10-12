import React from 'react'
import Shuffle from '../../Reactbits/Shuffle/Shuffle'

const Teamname = () => {
  return (
    <div>
        <Shuffle
          text="Team Cyber"
          className="text-xs lg:text-sm xl:text-base"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
          respectReducedMotion={true}
        />

    </div>
  )
}

export default Teamname