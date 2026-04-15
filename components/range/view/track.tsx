import classNames from 'classnames';
import React from 'react';
const Track = ({ prefix = 'next-' }: { prefix?: string }) => {
    const classes = classNames({
        [`${prefix}range-track`]: true,
    });
    return <div className={classes} />;
};

Track.displayName = 'Track';

export default Track;
