import classNames from 'classnames';
import React from 'react';
const Track = ({ prefix }: { prefix: string }) => {
    const classes = classNames({
        [`${prefix}range-track`]: true,
    });
    return <div className={classes} />;
};

Track.defaultProps = {
    prefix: 'next-',
};

Track.displayName = 'Track';

export default Track;
