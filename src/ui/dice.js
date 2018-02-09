/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './dice.css';

const Dice = ({ faceCount, faceValue }) => {
    const classNames = ['bgio-dice'];

    return (
        <div className={classNames.join(' ')} {...rest}>
            {faceValue}
        </div>
    );
};

Dice.propTypes = {
    faceCount: PropTypes.number,
    faceValue: PropTypes.number
};

Dice.defaultProps = {
    faceCount: 6,
    faceValue: 1
};